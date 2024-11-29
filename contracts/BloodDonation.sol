// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract BloodDonation {
    struct Donor {
        string name;
        uint age;
        string contact;
        uint totalDonations;
        bool isRegistered;
    }

    struct Donation {
        address donor;
        string bloodType;
        uint quantity;
        string donorName;
        uint age;
        string contact;
        uint timestamp;
        bool isValid;
    }

    struct BloodRequest {
        address requester;
        string bloodType;
        uint quantity;
        string recipientName;
        uint age;
        string contact;
        string hospital;
        string reason;
        bool fulfilled;
        uint timestamp;
        bool isValid;
    }

    mapping(address => Donor) public donors;
    mapping(uint => Donation) public donations;
    mapping(uint => BloodRequest) public requests;
    mapping(string => uint) private bloodInventory;

    uint private _totalDonors;
    uint private _totalDonations;
    uint private _totalRequests;

    uint public constant DONATION_AMOUNT = 450; // Standard donation amount in ml

    event DonorRegistered(address indexed donor, string name);
    event BloodDonated(
        uint indexed donationId,
        address indexed donor,
        string bloodType,
        uint quantity
    );
    event BloodRequested(
        uint indexed requestId,
        address indexed requester,
        string bloodType,
        uint quantity
    );
    event RequestFulfilled(
        uint indexed requestId,
        address indexed requester,
        string bloodType,
        uint quantity
    );

    modifier validBloodType(string memory bloodType) {
        require(
            keccak256(bytes(bloodType)) == keccak256(bytes("A+")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("A-")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("B+")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("B-")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("AB+")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("AB-")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("O+")) ||
            keccak256(bytes(bloodType)) == keccak256(bytes("O-")),
            "Invalid blood type"
        );
        _;
    }

    modifier validAge(uint age) {
        require(age >= 17 && age <= 70, "Donor must be between 17 and 70 years old");
        _;
    }

    function donate(
        string memory bloodType,
        uint quantity,
        string memory donorName,
        uint age,
        string memory contact
    ) public validBloodType(bloodType) validAge(age) {
        require(quantity == DONATION_AMOUNT, "Donation amount must be 450ml");
        require(bytes(donorName).length > 0, "Donor name is required");
        require(bytes(contact).length > 0, "Contact information is required");

        if (!donors[msg.sender].isRegistered) {
            donors[msg.sender] = Donor({
                name: donorName,
                age: age,
                contact: contact,
                totalDonations: 0,
                isRegistered: true
            });
            _totalDonors++;
            emit DonorRegistered(msg.sender, donorName);
        }

        donations[_totalDonations] = Donation({
            donor: msg.sender,
            bloodType: bloodType,
            quantity: quantity,
            donorName: donorName,
            age: age,
            contact: contact,
            timestamp: block.timestamp,
            isValid: true
        });

        bloodInventory[bloodType] += quantity;
        donors[msg.sender].totalDonations++;
        
        emit BloodDonated(_totalDonations, msg.sender, bloodType, quantity);
        _totalDonations++;
    }

    function requestBlood(
        string memory bloodType,
        uint quantity,
        string memory recipientName,
        uint age,
        string memory contact,
        string memory hospital,
        string memory reason
    ) public validBloodType(bloodType) {
        require(quantity > 0 && quantity % DONATION_AMOUNT == 0, "Quantity must be in units of 450ml");
        require(bloodInventory[bloodType] >= quantity, "Insufficient blood quantity available");
        require(bytes(recipientName).length > 0, "Recipient name is required");
        require(bytes(contact).length > 0, "Contact information is required");
        require(bytes(hospital).length > 0, "Hospital name is required");
        require(bytes(reason).length > 0, "Reason for request is required");

        requests[_totalRequests] = BloodRequest({
            requester: msg.sender,
            bloodType: bloodType,
            quantity: quantity,
            recipientName: recipientName,
            age: age,
            contact: contact,
            hospital: hospital,
            reason: reason,
            fulfilled: false,
            timestamp: block.timestamp,
            isValid: true
        });

        bloodInventory[bloodType] -= quantity;
        
        emit BloodRequested(_totalRequests, msg.sender, bloodType, quantity);
        _totalRequests++;
    }

    function fulfillRequest(uint requestId) public {
        require(requestId < _totalRequests, "Invalid request ID");
        BloodRequest storage request = requests[requestId];
        require(request.isValid, "Request is not valid");
        require(!request.fulfilled, "Request already fulfilled");

        request.fulfilled = true;
        
        emit RequestFulfilled(
            requestId,
            request.requester,
            request.bloodType,
            request.quantity
        );
    }

    function getBloodTypeQuantity(string memory bloodType) 
        public 
        view 
        validBloodType(bloodType) 
        returns (uint) 
    {
        return bloodInventory[bloodType];
    }

    function getTotalDonors() public view returns (uint) {
        return _totalDonors;
    }

    function getTotalDonations() public view returns (uint) {
        return _totalDonations;
    }

    function getTotalRequests() public view returns (uint) {
        return _totalRequests;
    }

    function getDonation(uint donationId) public view returns (
        address donor,
        string memory bloodType,
        uint quantity,
        string memory donorName,
        uint age,
        string memory contact,
        uint timestamp,
        bool isValid
    ) {
        require(donationId < _totalDonations, "Invalid donation ID");
        Donation storage d = donations[donationId];
        return (
            d.donor,
            d.bloodType,
            d.quantity,
            d.donorName,
            d.age,
            d.contact,
            d.timestamp,
            d.isValid
        );
    }

    function getRequest(uint requestId) public view returns (
        address requester,
        string memory bloodType,
        uint quantity,
        string memory recipientName,
        uint age,
        string memory contact,
        string memory hospital,
        string memory reason,
        bool fulfilled,
        uint timestamp,
        bool isValid
    ) {
        require(requestId < _totalRequests, "Invalid request ID");
        BloodRequest storage r = requests[requestId];
        return (
            r.requester,
            r.bloodType,
            r.quantity,
            r.recipientName,
            r.age,
            r.contact,
            r.hospital,
            r.reason,
            r.fulfilled,
            r.timestamp,
            r.isValid
        );
    }
}
