# Admin User Guide

This guide covers all administrative functions of the SSC Token Platform.

## 1. Admin Panel Access

### 1.1 Login as Admin

1. Navigate to `https://yourdomain.com`
2. Click "Admin" in the navigation
3. Log in with admin credentials
4. Admins are identified by role: `ADMIN` or `SUPER_ADMIN`

### 1.2 Role Permissions

| Feature | User | Admin | Super Admin |
|---|---|---|---|
| View own data | ✅ | ✅ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| Manage users | ❌ | ✅ | ✅ |
| View transactions | Own only | ✅ | ✅ |
| Manage buyback requests | Create own | ✅ | ✅ |
| Manage profit distributions | ❌ | ✅ | ✅ |
| System settings | ❌ | ❌ | ✅ |

## 2. User Management

### 2.1 View All Users

Navigate to **Admin > Users** to see:
- User ID
- Email address
- Wallet address
- Role
- Status (Active/Inactive)
- Created date

### 2.2 Search Users

Use the search box to find users by:
- Email address
- Wallet address

### 2.3 User Actions

- **View Details**: Click on a user to see their profile
- **Edit Role**: Change user role (ADMIN / USER)
- **Activate/Deactivate**: Toggle user status
- **Delete User**: Remove a user account (use carefully)

## 3. Transaction Management

### 3.1 View All Transactions

Navigate to **Admin > Transactions** to see:
- Transaction ID
- User
- Type (BUY, SELL, BUYBACK, PROFIT_DISTRIBUTION, TRANSFER)
- Amount
- Status (PENDING, COMPLETED, FAILED, CANCELLED)
- Date

### 3.2 Filter Transactions

Filter by:
- Type
- Status
- User
- Date range

### 3.3 Transaction Details

Click on a transaction to view:
- Full transaction details
- Hash/ID on blockchain
- Status history

## 4. Buyback Request Management

### 4.1 View All Buyback Requests

Navigate to **Admin > Buyback Requests** to see:
- Request ID
- User
- Amount requested
- Status (PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED)
- Date

### 4.2 Review and Approve

1. Click on a PENDING request
2. Review the details
3. Choose one of:
   - **Approve**: Mark as approved, process next
   - **Reject**: Reject with reason
   - **Cancel**: Cancel the request

### 4.3 Approve Buyback

To approve a buyback:
1. Verify user has sufficient token balance
2. Verify buyback funds are available
3. Click "Approve"
4. System will process the buyback automatically

### 4.4 Complete Buyback

After processing:
1. Mark the buyback as COMPLETED
2. Verify blockchain transaction is confirmed
3. Notify the user (automatic)

### 4.5 Reject Buyback

If rejecting:
1. Provide a reason for rejection
2. Click "Reject"
3. User will be notified

## 5. Profit Distribution

### 5.1 Create Profit Distribution

Navigate to **Admin > Profit Distributions**

1. Click "New Distribution"
2. Fill in:
   - **Period**: Time period (e.g., "Q1 2024")
   - **Total Amount**: Amount to distribute
   - **Start Date**: Distribution start date
   - **End Date**: Distribution end date
3. Upload recipient list (CSV format) or select all eligible users
4. Click "Create"

### 5.2 CSV Format for Recipients

```csv
wallet_address,amount
0x1234...,100.50
0x5678...,200.75
```

### 5.3 Manage Distribution

- **View Status**: See distribution progress
- **Mark as Complete**: When all payments sent
- **Cancel Distribution**: If needed

### 5.4 Distribution Rules

- Only one active distribution per period
- Users must hold tokens during the period to be eligible
- Distribution amounts are proportional to holdings

## 6. System Statistics

### 6.1 Dashboard Overview

The admin dashboard shows:
- Total users
- Active transactions
- Pending buyback requests
- Total token supply
- Profit distributed

### 6.2 Key Metrics

| Metric | Description |
|---|---|
| Total Users | All registered users |
| Active Users | Users with transactions in last 30 days |
| Token Supply | Current circulating supply |
| Total Volume | All transaction volume |
| Pending Buybacks | Number of pending buyback requests |
| Active Distributions | Currently running profit distributions |

## 7. Audit Log

### 7.1 View Audit Log

Navigate to **Admin > Audit Log** to see:
- Action performed
- User who performed it
- Timestamp
- IP address
- User agent

### 7.2 Filter Audit Log

Filter by:
- User
- Action type
- Date range

### 7.3 Export Audit Log

Export audit log for compliance:
1. Click "Export"
2. Select date range
3. Download CSV

## 8. Smart Contract Operations

### 8.1 Token Minting

**Important:** Only contract owner can mint tokens.

1. Navigate to **Admin > Smart Contract**
2. Click "Mint Tokens"
3. Enter:
   - Recipient address
   - Amount
4. Confirm transaction
5. Monitor on BSCScan

### 8.2 Token Burning

1. Navigate to **Admin > Smart Contract**
2. Click "Burn Tokens"
3. Enter:
   - Amount to burn
4. Confirm transaction
5. Monitor on BSCScan

### 8.3 Pause/Unpause Contract

**Warning:** Pausing stops all token transfers.

1. Navigate to **Admin > Smart Contract**
2. Click "Pause" or "Unpause"
3. Confirm action
4. Verify on BSCScan

### 8.4 Upgrade Contract

For UUPS upgradeable contracts:
1. Deploy new implementation contract
2. Verify on BSCScan
3. Upgrade proxy to point to new implementation
4. Test thoroughly before going live

### 8.5 Transfer Ownership

1. Navigate to **Admin > Smart Contract**
2. Click "Transfer Ownership"
3. Enter new owner address
4. Confirm transaction
5. New owner must accept ownership

## 9. Emergency Procedures

### 9.1 Pause Contract

If malicious activity detected:
1. Immediately pause the contract
2. Notify all stakeholders
3. Investigate the issue
4. Fix the issue
5. Unpause after verification

### 9.2 Revert Transaction

Transactions on blockchain are irreversible. If an error occurs:
1. Document the error
2. Contact affected users
3. Create manual adjustment if possible
4. Update documentation

### 9.3 Revoke Admin Access

If admin account is compromised:
1. Change admin password immediately
2. Review recent admin actions
3. Revoke compromised session tokens
4. Enable additional security measures

## 10. Security Best Practices

- Use strong passwords for admin accounts
- Enable 2FA if available
- Never share admin credentials
- Log out after each session
- Review audit logs regularly
- Keep software updated
- Monitor for suspicious activity

## 11. Contact Support

For issues or questions:
- Email: support@yourdomain.com
- Slack: #ssc-admin
- Emergency: Contact on-call via [monitoring system](./MONITORING.md)
