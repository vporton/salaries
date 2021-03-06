//SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.7.1;

import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";
import { IERC1155 } from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import { ERC1155 } from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import { IERC1155Views } from "@vporton/wrap-tokens/contracts/IERC1155Views.sol";
import { ERC1155WithTotals } from "@vporton/future-contracts/contracts/ERC1155/ERC1155WithTotals.sol";
import { SalaryWithDAO } from "@vporton/future-contracts/contracts/SalaryWithDAO.sol";

/// Some members may be missing, it's OK.
///
/// Logically wrong base class, but it isn't formally an error. 
abstract contract MyBase is SalaryWithDAO { }

/// Represent all tokens of a salary recipient's condition as one token.
///
/// This contract has a bug: It does not emit ERC-1155 events.
///
/// Traders, PLEASE, don't trade this token: It creates an incentive to kill the salary recipient
/// to decrease token price. (Its price will anyway go down nearing to zero in the future.)
/// Instead, trade either individual tokens or (yet to be created composite token).
contract UnitedSalaryTokenWrapper is ERC165, IERC1155/*, IERC1155Views*/ {
    bytes4 private constant _INTERFACE_ID_ERC1155 = 0xd9b67a26;

    /*
     *     bytes4(keccak256('totalSupply(uint256)')) == 0xbd85b039
     *     bytes4(keccak256('name(uint256)')) == 0x00ad800c
     *     bytes4(keccak256('symbol(uint256)')) == 0x4e41a1fb
     *     bytes4(keccak256('decimals(uint256)')) == 0x3f47e662
     *     bytes4(keccak256('uri(uint256)')) == 0x0e89341c
     *
     *     => 0xbd85b039 ^ 0x00ad800c ^ 0x4e41a1fb ^ 0x3f47e662 ^ 0x0e89341c == 0xc2a743b0
     */
    bytes4 private constant _INTERFACE_ID_ERC1155_VIEWS = 0xc2a743b0;

    MyBase public salaries;

    string internal uri_;

    // solhint-disable func-visibility
    constructor(MyBase _salaries, string memory _uri) {
        _setURI(_uri);
        salaries = _salaries;

        // register the supported interfaces to conform to ERC1155 via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155);

        // register the supported interfaces to conform to ERC1155Views via ERC165
        _registerInterface(_INTERFACE_ID_ERC1155_VIEWS);
    }
    // solhint-enable func-visibility

    /// Conforms to `IERC1155Views`.
    function totalSupply(uint256 _id) public view returns (uint256) {
        return IERC1155Views(address(salaries)).totalSupply(_id);
    }

    function name(uint256 _id) public view returns (string memory) {
        return IERC1155Views(address(salaries)).name(_id); // intentionally no `_getCurrent()`
    }

    function symbol(uint256 _id) public view returns (string memory) {
        return IERC1155Views(address(salaries)).symbol(_id); // intentionally no `_getCurrent()`
    }

    function decimals(uint256 _id) public view returns (uint8) {
        return IERC1155Views(address(salaries)).decimals(_id); // intentionally no `_getCurrent()`
    }

    function balanceOf(address _account, uint256 _id) public view override returns (uint256) {
        return salaries.balanceOf(_getCurrent(_account), _id);
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    )
        public
        view
        override
        returns (uint256[] memory batchBalances)
    {
        require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");

        batchBalances = new uint256[](accounts.length);

        for (uint i = 0; i < ids.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }
    }

    /// This contract needs first be approved for the ERC-20 transfers (the recommended approval sum is ~uint256(0)).
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    )
        public
        virtual
        override
    {
        salaries.safeTransferFrom(_getCurrent(from), _getCurrent(to), id, amount, data);
    }

    /// This contract needs first be approved for the ERC-20 transfers (the recommended approval sum is ~uint256(0)).
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    )
        public
        virtual
        override
    {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");

        uint256[] memory _currentIds = new uint256[](ids.length);
        for (uint i = 0; i < ids.length; ++i) {
            _currentIds[i] = ids[i];
        }
        salaries.safeBatchTransferFrom(_getCurrent(from), _getCurrent(to), ids, amounts, data);
    }

    function isApprovedForAll(address account, address operator) public view override returns (bool) {
        return salaries.isApprovedForAll(account, operator);
    }

    function setApprovalForAll(address operator, bool approved) public override {
        salaries.setApprovalForAll(operator, approved);
    }

    function uri(uint256 /*_id*/) public view returns (string memory) {
        return uri_;
    }

    function _setURI(string memory newuri) internal virtual {
        uri_ = newuri;
    }

    function _getOriginal(address _account) internal view returns (address) {
        address _current = salaries.originalToCurrentAddresses(_account);
        return _current != address(0) ? _current : _account;
    }

    // TODO: Use `getCurrent()` from `BaseSalaries`.
    function _getCurrent(address _account) internal view returns (address) {
        address _original = salaries.originalAddresses(_account);
        return _original != address(0) ? _original : _account;
    }
}
