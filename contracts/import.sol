// SPDX-License-Identifier: GPL-3.0-or-later
// HardHat workaround:
// pragma solidity ^0.7.5;
pragma solidity >=0.5.0;

import { ProxyAdmin } from "@openzeppelin/contracts/proxy/ProxyAdmin.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/TransparentUpgradeableProxy.sol";

import { SalaryWithDAO } from "@vporton/future-contracts/contracts/SalaryWithDAO.sol";
import { DefaultDAOInterface } from "@vporton/future-contracts/contracts/DefaultDAOInterface.sol";
import { NFTRestoreContract } from "@vporton/future-contracts/contracts/NFTRestoreContract.sol";

import { ERC1155OverERC20 } from "@vporton/wrap-tokens/contracts/ERC1155OverERC20.sol";
import { ERC1155OverERC721 } from "@vporton/wrap-tokens/contracts/ERC1155OverERC721.sol";
import { ERC1155LockedETH } from "@vporton/wrap-tokens/contracts/ERC1155LockedETH.sol";

import { ERC1155Mock } from "@vporton/wrap-tokens/contracts/test/ERC1155Mock.sol";
import { MockCoin } from "@vporton/wrap-tokens/contracts/test/MockCoin.sol";
