//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;
pragma abicoder v2;

import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { BaseLock } from "@vporton/future-contracts/contracts/BaseLock.sol";
import { ERC1155LockedETH } from "@vporton/wrap-tokens/contracts/ERC1155LockedETH.sol";
import { ERC1155OverERC20 } from "@vporton/wrap-tokens/contracts/ERC1155OverERC20.sol";
import { ERC1155OverERC721 } from "@vporton/wrap-tokens/contracts/ERC1155OverERC721.sol";
import { ERC1155FromERC721 } from "@vporton/wrap-tokens/contracts/ERC1155FromERC721.sol";
import { ERC1155TokenReceiver } from "@vporton/future-contracts/contracts/ERC1155/ERC1155TokenReceiver.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { IMyERC721 } from "@vporton/wrap-tokens/contracts/IMyERC721.sol";

contract LockAggregator is ERC1155TokenReceiver {
    using SafeMath for uint256;

    uint256 constant erc1155LockedETHTokenId = 0;

    BaseLock public locker;
    uint64 public oracleId;
    ERC1155LockedETH public erc1155LockedETH;
    ERC1155OverERC20 public erc20Wrapper;
    ERC1155OverERC721 public erc721Wrapper;

    // token/oracle hash => amount
    mapping(uint256 => uint256) public tokenAmounts;

    constructor(
        BaseLock _locker,
        ERC1155LockedETH _erc1155LockedETH,
        ERC1155OverERC20 _erc20Wrapper,
        ERC1155OverERC721 _erc721Wrapper
    ) {
        locker = _locker;
        erc1155LockedETH = _erc1155LockedETH;
        erc20Wrapper = _erc20Wrapper;
        erc721Wrapper = _erc721Wrapper;
        erc1155LockedETH.setApprovalForAll(address(locker), true);
    }

    receive() external payable {
        bytes memory _data; 
        erc1155LockedETH.borrowETH{value: msg.value}(address(this), _data);
        locker.donate(
            erc1155LockedETH,
            erc1155LockedETHTokenId,
            oracleId,
            msg.value,
            address(this),
            msg.sender,
            _data);
    }

    function takeDonationERC1155(IERC1155 _erc1155, uint256 _tokenId, bytes memory data)
        public
    {
        uint256 _tokenHash = _erc1155Hash(_erc1155, _tokenId, oracleId);
        uint256 _amount = _erc1155.balanceOf(address(this), _tokenId);
        // Last against reentrancy vulnerabilty:
        locker.donate(
            _erc1155,
            _tokenId,
            oracleId,
            _amount,
            address(this),
            msg.sender,
            "");
    }

    /// Can be called by anybody.
    function takeDonationERC20(IERC20 _erc20) public {
        takeDonationERC1155(erc20Wrapper, uint256(uint160(address(_erc20))), "");
    }

    /// Can be called by anybody.
    function takeDonationERC721(IERC721 _erc721, uint256 _tokenId) public {
        uint256 _erc1155TokenId = erc721Wrapper.registerERC721Token(
            ERC1155FromERC721.ERC721Token({ erc721Contract: IMyERC721(address(_erc721)), erc721TokenId: _tokenId }));
        takeDonationERC1155(erc721Wrapper, _erc1155TokenId, "");
    }

    function onERC1155Received(
        address /*operator*/,
        address /*from*/,
        uint256 /*id*/,
        uint256 /*value*/,
        bytes calldata /*data*/
    )
        external virtual override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address /*operator*/,
        address /*from*/,
        uint256[] calldata /*ids*/,
        uint256[] calldata /*values*/,
        bytes calldata /*data*/
    )
        external virtual override returns(bytes4)
    {
        return 0;
    }

    uint8 constant TOKEN_ERC1155 = 0;
    uint8 constant TOKEN_ERC721 = 1;
    uint8 constant TOKEN_ERC20 = 2;

    function _erc1155Hash(IERC1155 _erc1155, uint256 _tokenId, uint64 _oracleId) internal returns (uint256) {
        return uint256(keccak256(abi.encodePacked(TOKEN_ERC1155, _erc1155, _tokenId)));
    }

    function _erc721Hash(IERC721 _erc721, uint256 _tokenId, uint64 _oracleId) internal returns (uint256) {
        return uint256(keccak256(abi.encodePacked(TOKEN_ERC721, _erc721, _tokenId)));
    }

    function _erc20Hash(IERC20 _erc20, uint64 _oracleId) internal returns (uint256) {
        return uint256(keccak256(abi.encodePacked(TOKEN_ERC20, _erc20)));
    }
}
