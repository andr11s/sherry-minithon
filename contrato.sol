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

    mapping(string => Campaign) public campaigns;
    mapping(bytes32 => bool) public tweetUrlUsed; // For campaign uniqueness

    event CampaignCreated(
        string indexed campaignId,
        address indexed creator,
        string tweetUrl,
        uint256 totalAmount,
        string criteria,
        uint256 maxWinners
    );
    event Claimed(string indexed campaignId, address indexed user, uint256 amount);
    event DebugAmount(uint256 amount);

    // Create a campaign (the creator must send AVAX equal to totalAmount)
    function createCampaign(
        string memory campaignId,
        string memory tweetUrl,
        string memory criteria,
        uint256 maxWinners
    ) external payable {
        require(msg.value > 0, "Must send AVAX for airdrop");
        require(maxWinners > 0, "There must be at least one winner");
        require(bytes(tweetUrl).length > 0, "tweetUrl empty");
        require(bytes(criteria).length > 0, "criteria empty");
        require(bytes(campaignId).length > 0, "campaignId empty");
        require(campaigns[campaignId].creator == address(0), "Campaign ID already exists");

        bytes32 tweetHash = keccak256(abi.encodePacked(tweetUrl));
        require(!tweetUrlUsed[tweetHash], "Campaign already exists for this tweetUrl");

        Campaign storage c = campaigns[campaignId];
        c.creator = msg.sender;
        c.tweetUrl = tweetUrl;
        c.totalAmount = msg.value;
        c.criteria = criteria;
        c.maxWinners = maxWinners;
        c.claimed = 0;
        c.active = true;

        tweetUrlUsed[tweetHash] = true;

        emit CampaignCreated(campaignId, msg.sender, tweetUrl, msg.value, criteria, maxWinners);
    }

    // Claim airdrop (backend validates off-chain and only calls if user is eligible)
    function claimAirdrop(string memory campaignId) external {
        Campaign storage c = campaigns[campaignId];
        require(c.active, "Campaign inactive");
        require(!c.hasClaimed[msg.sender], "Already claimed");
        require(c.claimed < c.maxWinners, "Max winners reached");

        uint256 amountPerWinner = c.totalAmount / c.maxWinners;
        uint256 amountToSend;

        // Si es el último, recibe todo el remanente
        if (c.claimed + 1 == c.maxWinners) {
            amountToSend = address(this).balance;
            // Evento de advertencia si hay remanente
            if (amountToSend > amountPerWinner) {
                emit DebugAmount(amountToSend - amountPerWinner); // Remanente extra
            }
        } else {
            amountToSend = amountPerWinner;
        }

        require(amountToSend > 0, "Amount to send is zero");
        require(address(this).balance >= amountToSend, "Insufficient contract balance");

        c.hasClaimed[msg.sender] = true;
        c.claimed += 1;

        if (c.claimed == c.maxWinners) {
            c.active = false;
        }

        (bool sent, ) = msg.sender.call{value: amountToSend}("");
        require(sent, "AVAX transfer failed");

        emit Claimed(campaignId, msg.sender, amountToSend);
    }

    // Check if a user has already claimed in a campaign
    function hasClaimed(string memory campaignId, address user) external view returns (bool) {
        return campaigns[campaignId].hasClaimed[user];
    }
}