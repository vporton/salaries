// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.6;
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

/// This contract does NOT emit events.
contract GnosisSafeERC20Wrapper is IERC1155 {
    function balanceOf(address account, uint256 id) external override view returns (uint256) {

    }

    function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids) external override view returns (uint256[] memory) {

    }

    function isApprovedForAll(address account, address operator) external override view returns (bool) {

    }

    function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data) external override {

    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external override {

    }

    function setApprovalForAll(address operator, bool approved) external override {

    }

    function supportsInterface(bytes4 interfaceId) external override view returns (bool) {

    }

}