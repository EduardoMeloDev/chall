// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ETHPool is AccessControl, Ownable {
    bytes32 public constant ONLY_TEAM = keccak256("ONLY_TEAM");

    uint256 public lastRun;

    uint256 public totalRewards;
    uint256 public totalStaked;
    bool depositReward;
    uint256 rewardInterval = 10 minutes; // 86400 = 1 day
    uint8 rewardFactor = 1;
    uint256 periodStake;

    struct userStake {
        uint256 amount;
        uint256 startTimestamp;
        uint256 lastAmountReward;
    }

    address[] public addresses;
    mapping(address => userStake) public userInfos;
    mapping(address => uint256) public rewards;

    receive() external payable {}

    fallback() external payable {}

    constructor(address root) {
        _setupRole(DEFAULT_ADMIN_ROLE, root);
        _setupRole(ONLY_TEAM, root);
        checkWeekTime();
    }

    modifier OnlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to Admins.");
        _;
    }

    modifier OnlyTeam() {
        require(isTeam(msg.sender), "Restricted to Team.");
        _;
    }

    function isAdmin(address account) public view virtual returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    function isTeam(address account) public view virtual returns (bool) {
        return hasRole(ONLY_TEAM, account);
    }

    function addTeam(address account) public virtual OnlyAdmin {
        grantRole(ONLY_TEAM, account);
    }

    function deposit(address payable _to) public payable {
        (bool sent, bytes memory data) = _to.call{value: msg.value}("");
        require(sent, "Failed to send Ether");
        userInfos[msg.sender].amount += msg.value;
        userInfos[msg.sender].startTimestamp = block.timestamp;
        totalStaked += msg.value;
        addresses.push(msg.sender);
    }

    function depositRewards() public payable OnlyTeam {
        totalRewards += msg.value;
        depositReward = true;
        periodStake = block.timestamp + 10 minutes;
    }

    function calculateReward(address _sender) public view returns (uint256) {
        uint256 withdrawRewardAmount;
        uint256 finalAmountReward;

        uint256 userInterval = block.timestamp -
            userInfos[_sender].startTimestamp;

        uint256 _total = rewardInterval - userInterval;

        uint256 rewardsPerToken = (totalRewards * 100) / totalStaked;

        withdrawRewardAmount =
            (((userInfos[_sender].amount * rewardsPerToken) / 100) /
                rewardInterval) *
            _total;

        finalAmountReward = (totalRewards - withdrawRewardAmount) - userInfos[_sender].lastAmountReward;

        return finalAmountReward;
    }

    function getReward(address _sender) public onlyOwner {
        require(depositReward, "no rewards available yet to be collected");
        uint256 returnReward;
        returnReward = calculateReward(_sender);
        userInfos[_sender].lastAmountReward += returnReward;
        address payable from = payable(_sender);
        from.transfer(returnReward);
    }

    function withdrawAmountAndReward(address _sender) public {
        require(depositReward, "The rewards isn't deposited yet.");
        uint256 totalRewardStake = calculateReward(_sender);
        uint256 total = userInfos[_sender].amount + totalRewardStake;
        address payable from = payable(_sender);
        from.transfer(total);
    }

    function withdrawAmount(address _sender) public {
        require(userInfos[_sender].amount > 0, "Needs to be greater than 0");
        uint256 total = userInfos[_sender].amount;
        address payable from = payable(_sender);
        totalStaked -= total;
        
        from.transfer(total);
    }

    function checkWeekTime() public {
        require(
            block.timestamp - lastRun > rewardInterval,
            "Need to wait 5 minutes"
        );
        lastRun = block.timestamp;
    }   

    function distributeRewards() public {
        checkWeekTime();
        for (uint256 i = 0; i < addresses.length; i++) {
            getReward(addresses[i]);
        }

        depositReward = false;
        delete addresses;
    }

}
