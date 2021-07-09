// Author: Pascal Marco Caversaccio
// E-Mail: pascal.caversaccio@hotmail.ch

const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { EIP712Domain } = require('../scripts/helper.js');

const { expectRevert, constants } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Forwarder = artifacts.require('Forwarder');

const config = require('../scripts/data-config.json');
const chain = 'rinkeby';
const name = config[chain].name;
const version = config[chain].version;

contract('Forwarder', function (accounts) {
  beforeEach(async function () {
    this.forwarder = await Forwarder.new(name, version);
    this.domain = {
      name,
      version,
      chainId: await web3.eth.getChainId(),
      verifyingContract: this.forwarder.address,
    };
    this.types = {
      EIP712Domain,
      ForwardRequest: [{
          name: 'from',
          type: 'address'
        },
        {
          name: 'to',
          type: 'address'
        },
        {
          name: 'value',
          type: 'uint256'
        },
        {
          name: 'gas',
          type: 'uint256'
        },
        {
          name: 'nonce',
          type: 'uint256'
        },
        {
          name: 'data',
          type: 'bytes'
        },
      ],
    };
  });

  context('whitelist', function () {
    context('addSenderToWhitelist', function () {
      it('success', async function () {
        expect(await this.forwarder.addSenderToWhitelist(accounts[1]));
      });
      it('already whitelisted', async function () {
        await expectRevert(this.forwarder.addSenderToWhitelist(accounts[0]),
        'AwlForwarder: sender address is already whitelisted', 
        );
      });
      it('prevents non-owners from executing', async function () {
        await expectRevert(
          this.forwarder.addSenderToWhitelist(accounts[2], {from: accounts[1]}),
          'Ownable: caller is not the owner',
        );
      });
    });
    context('removeSenderFromWhitelist', function () {
      it('success', async function () {
        expect(await this.forwarder.removeSenderFromWhitelist(accounts[0]));
      });
      it('prevents non-owners from executing', async function () {
        await expectRevert(
          this.forwarder.removeSenderFromWhitelist(accounts[0], {from: accounts[1]}),
          'Ownable: caller is not the owner',
        );
      });
    });
  });

  context('with message', function () {
    beforeEach(async function () {
      this.wallet = Wallet.generate();
      this.sender = web3.utils.toChecksumAddress(this.wallet.getAddressString());
      this.req = {
        from: this.sender,
        to: constants.ZERO_ADDRESS,
        value: '0',
        gas: '100000',
        nonce: Number(await this.forwarder.getNonce(this.sender)),
        data: '0x',
      };
      this.sign = ethSigUtil.signTypedMessage(
        this.wallet.getPrivateKey(), {
          data: {
            types: this.types,
            domain: this.domain,
            primaryType: 'ForwardRequest',
            message: this.req,
          },
        },
      );
    });

    context('verify', function () {
      context('valid signature', function () {
        beforeEach(async function () {
          expect(await this.forwarder.getNonce(this.req.from))
            .to.be.bignumber.equal(web3.utils.toBN(this.req.nonce));
        });

        it('success', async function () {
          expect(await this.forwarder.verify(this.req, this.sign)).to.be.equal(true);
        });

        afterEach(async function () {
          expect(await this.forwarder.getNonce(this.req.from))
            .to.be.bignumber.equal(web3.utils.toBN(this.req.nonce));
        });
      });

      context('invalid signature', function () {
        it('tampered from', async function () {
          expect(await this.forwarder.verify({
              ...this.req,
              from: accounts[0]
            }, this.sign))
            .to.be.equal(false);
        });
        it('tampered to', async function () {
          expect(await this.forwarder.verify({
              ...this.req,
              to: accounts[0]
            }, this.sign))
            .to.be.equal(false);
        });
        it('tampered value', async function () {
          expect(await this.forwarder.verify({
              ...this.req,
              value: web3.utils.toWei('1')
            }, this.sign))
            .to.be.equal(false);
        });
        it('tampered nonce', async function () {
          expect(await this.forwarder.verify({
              ...this.req,
              nonce: this.req.nonce + 1
            }, this.sign))
            .to.be.equal(false);
        });
        it('tampered data', async function () {
          expect(await this.forwarder.verify({
              ...this.req,
              data: '0x1742'
            }, this.sign))
            .to.be.equal(false);
        });
        it('tampered signature', async function () {
          const tamperedsign = web3.utils.hexToBytes(this.sign);
          tamperedsign[42] ^= 0xff;
          expect(await this.forwarder.verify(this.req, web3.utils.bytesToHex(tamperedsign)))
            .to.be.equal(false);
        });
      });
    });

    context('execute', function () {
      context('valid signature', function () {
        beforeEach(async function () {
          expect(await this.forwarder.getNonce(this.req.from))
            .to.be.bignumber.equal(web3.utils.toBN(this.req.nonce));
        });

        it('success', async function () {
          await this.forwarder.execute(this.req, this.sign); // expect to not revert
        });

        afterEach(async function () {
          expect(await this.forwarder.getNonce(this.req.from))
            .to.be.bignumber.equal(web3.utils.toBN(this.req.nonce + 1));
        });
      });

      context('invalid msg.sender', function () {
        it('msg.sender not whitelisted', async function () {
          await expectRevert(
            this.forwarder.execute(this.req, this.sign, {from: accounts[1]}),
            'AwlForwarder: sender of meta-transaction is not whitelisted',
          );
        });
      });
      context('when paused', function () {
        it('cannot execute normal process in pause', async function () {
          await this.forwarder.pause({from: accounts[0]});
          await expectRevert(
            this.forwarder.execute(this.req, this.sign, {from: accounts[1]}),
            'Pausable: paused',
          );
        });
      });

      context('invalid signature', function () {
        it('tampered from', async function () {
          await expectRevert(
            this.forwarder.execute({
              ...this.req,
              from: accounts[0]
            }, this.sign),
            'AwlForwarder: signature does not match request',
          );
        });
        it('tampered to', async function () {
          await expectRevert(
            this.forwarder.execute({
              ...this.req,
              to: accounts[0]
            }, this.sign),
            'AwlForwarder: signature does not match request',
          );
        });
        it('tampered value', async function () {
          await expectRevert(
            this.forwarder.execute({
              ...this.req,
              value: web3.utils.toWei('1')
            }, this.sign),
            'AwlForwarder: signature does not match request',
          );
        });
        it('tampered nonce', async function () {
          await expectRevert(
            this.forwarder.execute({
              ...this.req,
              nonce: this.req.nonce + 1
            }, this.sign),
            'AwlForwarder: signature does not match request',
          );
        });
        it('tampered data', async function () {
          await expectRevert(
            this.forwarder.execute({
              ...this.req,
              data: '0x1742'
            }, this.sign),
            'AwlForwarder: signature does not match request',
          );
        });
        it('tampered signature', async function () {
          const tamperedsign = web3.utils.hexToBytes(this.sign);
          tamperedsign[42] ^= 0xff;
          await expectRevert(
            this.forwarder.execute(this.req, web3.utils.bytesToHex(tamperedsign)),
            'AwlForwarder: signature does not match request',
          );
        });
      });
    });
  });

  context('pause', function () {
    it('success', async function () {
      expect(await this.forwarder.pause({from: accounts[0]}));
    });
    it('prevents non-owners from executing', async function () {
      await expectRevert(
        this.forwarder.pause({from: accounts[1]}),
        'Ownable: caller is not the owner',
      );
    });
  });

  context('unpause', function () {
    it('success', async function () {
      await this.forwarder.pause({from: accounts[0]});
      expect(await this.forwarder.unpause({from: accounts[0]}));
    });
    it('prevents non-owners from executing', async function () {
      await this.forwarder.pause({from: accounts[0]});
      await expectRevert(
        this.forwarder.unpause({from: accounts[1]}),
        'Ownable: caller is not the owner',
      );
    });
  });
  
  context('sending ETH', function () {
    it('prevents from sending ETH directly to the contract', async function () {
      await expectRevert(
        web3.eth.sendTransaction({from: accounts[0], to: this.forwarder.address, value: '1000000000000000000'}),
        'function selector was not recognized and there\'s no fallback nor receive function',
      );
    });
  });

  context('killForwarder', function () {
    it('success', async function () {
      expect(await this.forwarder.killForwarder(accounts[0], {from: accounts[0]}));
    });
    it('prevents non-owners from executing', async function () {
      await expectRevert(
        this.forwarder.killForwarder(accounts[0], {from: accounts[1]}),
        'Ownable: caller is not the owner',
      );
    });
  });
});
