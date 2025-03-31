const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdFunding Contract", function () {
  let CrowdFunding, crowdfunding, owner, addr1, addr2;

  beforeEach(async function () {
    // Deploy the contract before each test
    [owner, addr1, addr2] = await ethers.getSigners();
    CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdfunding = await CrowdFunding.deploy();
    await crowdfunding.waitForDeployment();
  });

  it("Should create a new campaign", async function () {
    const title = "Save the Ocean";
    const description = "A campaign to protect marine life";
    const target = ethers.parseEther("5");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const image = "https://example.com/image.jpg";

    const tx = await crowdfunding.createCampaign(
      owner.address,
      title,
      description,
      target,
      deadline,
      image
    );

    await tx.wait();

    const campaign = await crowdfunding.campaigns(0);

    expect(campaign.owner).to.equal(owner.address);
    expect(campaign.title).to.equal(title);
    expect(campaign.description).to.equal(description);
    expect(campaign.target).to.equal(target);
    expect(campaign.deadline).to.equal(deadline);
    expect(campaign.image).to.equal(image);
  });

  it("Should fail to create a campaign with past deadline", async function () {
    const pastDeadline =
      (await ethers.provider.getBlock("latest")).timestamp - 3600;

      await expect(
        crowdfunding.createCampaign(
          owner.address,
          "Past Campaign",
          "This should fail",
          ethers.parseEther("3"),
          pastDeadline,
          "https://example.com/fail.jpg"
        )
      ).to.be.revertedWith("The deadline should be a date in the future");  // Use a string, not a custom error
      
  });

  it("Should allow users to donate to a campaign", async function () {
    const target = ethers.parseEther("5");
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    await crowdfunding.createCampaign(
      owner.address,
      "Support Education",
      "Funding education for kids",
      target,
      deadline,
      "https://example.com/edu.jpg"
    );

    const donationAmount = ethers.parseEther("1");

    await expect(() =>
      crowdfunding.connect(addr1).donateToCampaign(0, { value: donationAmount })
    ).to.changeEtherBalances([addr1, owner], [-donationAmount, donationAmount]);

    const [donators, donations] = await crowdfunding.getDonators(0);
    expect(donators).to.include(addr1.address);
    expect(donations[0]).to.equal(donationAmount);
  });

  it("Should retrieve all campaigns", async function () {
    await crowdfunding.createCampaign(
      owner.address,
      "Campaign 1",
      "Description 1",
      ethers.parseEther("2"),
      Math.floor(Date.now() / 1000) + 5000,
      "https://example.com/1.jpg"
    );

    await crowdfunding.createCampaign(
      addr1.address,
      "Campaign 2",
      "Description 2",
      ethers.parseEther("3"),
      Math.floor(Date.now() / 1000) + 6000,
      "https://example.com/2.jpg"
    );

    const allCampaigns = await crowdfunding.getCampaign();
    expect(allCampaigns.length).to.equal(2);
    expect(allCampaigns[0].owner).to.equal(owner.address);
    expect(allCampaigns[1].owner).to.equal(addr1.address);
  });
});
