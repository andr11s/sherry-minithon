// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialAirdropFactory {
    struct Campaign {
        address creator;
        string tweetUrl;
        uint256 totalAmount;
        string criteria;
        uint256 maxWinners;
        uint256 claimed;
        bool active;
        mapping(address => bool) hasClaimed;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(bytes32 => bool) public tweetUrlUsed; // For campaign uniqueness

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string tweetUrl,
        uint256 totalAmount,
        string criteria,
        uint256 maxWinners
    );
    event Claimed(uint256 indexed campaignId, address indexed user, uint256 amount);

    // Create a campaign (the creator must send AVAX equal to totalAmount)
    function createCampaign(
        string memory tweetUrl,
        string memory criteria,
        uint256 maxWinners
    ) external payable returns (uint256) {
        require(msg.value > 0, "Must send AVAX for airdrop");
        require(maxWinners > 0, "There must be at least one winner");
        require(bytes(tweetUrl).length > 0, "tweetUrl empty");
        require(bytes(criteria).length > 0, "criteria empty");

        bytes32 tweetHash = keccak256(abi.encodePacked(tweetUrl));
        require(!tweetUrlUsed[tweetHash], "Campaign already exists for this tweetUrl");

        campaignCount++;
        Campaign storage c = campaigns[campaignCount];
        c.creator = msg.sender;
        c.tweetUrl = tweetUrl;
        c.totalAmount = msg.value;
        c.criteria = criteria;
        c.maxWinners = maxWinners;
        c.claimed = 0;
        c.active = true;

        tweetUrlUsed[tweetHash] = true;

        emit CampaignCreated(campaignCount, msg.sender, tweetUrl, msg.value, criteria, maxWinners);
        return campaignCount;
    }

    // Claim airdrop (backend validates off-chain and only calls if user is eligible)
    function claimAirdrop(uint256 campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(c.active, "Campaign inactive");
        require(!c.hasClaimed[msg.sender], "Already claimed");
        require(c.claimed < c.maxWinners, "Max winners reached");

        uint256 amount = c.totalAmount / c.maxWinners;
        c.hasClaimed[msg.sender] = true;
        c.claimed += 1;

        // If last claim, deactivate campaign
        if (c.claimed == c.maxWinners) {
            c.active = false;
        }

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "AVAX transfer failed");

        emit Claimed(campaignId, msg.sender, amount);
    }

    // Check if a user has already claimed in a campaign
    function hasClaimed(uint256 campaignId, address user) external view returns (bool) {
        return campaigns[campaignId].hasClaimed[user];
    }

    // Optionally: allow creator to withdraw unclaimed funds after a period
    // function withdrawUnclaimed(uint256 campaignId) external { ... }
}