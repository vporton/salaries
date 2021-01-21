//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import { BaseLock } from "@vporton/future-contracts/contracts/BaseLock.sol";
import { ERC1155LockedETH } from "@vporton/wrap-tokens/contracts/ERC1155LockedETH.sol";
import { ERC1155TokenReceiver } from "@vporton/future-contracts/contracts/ERC1155/ERC1155TokenReceiver.sol";

contract DonateETH is ERC1155TokenReceiver {
    uint256 constant tokenId = 0;

    BaseLock public locker;
    ERC1155LockedETH public erc1155LockedETH;

    constructor(BaseLock _locker, ERC1155LockedETH _erc1155LockedETH) {
        locker = _locker;
        erc1155LockedETH = _erc1155LockedETH;
    }

    function donate(uint64 _oracleId, address _to, bytes calldata _data) public payable {
        erc1155LockedETH.setApprovalForAll(address(locker), true);
        erc1155LockedETH.borrowETH{value: msg.value}(address(this), _data);
        locker.donate(
            erc1155LockedETH,
            tokenId, // erc1155LockedETH.tokenId, // FIXME
            _oracleId,
            msg.value,
            address(this),
            _to,
            _data);
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    )
        external virtual override returns(bytes4)
    {
        return bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)"));
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    )
        external virtual override returns(bytes4)
    {
        return 0;
    }
}
