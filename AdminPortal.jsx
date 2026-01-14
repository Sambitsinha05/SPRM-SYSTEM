import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './AdminPortal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminPortal = () => {
    const [portalName] = useState("Admin Portal");
    const [currentView, setCurrentView] = useState('dashboard');
    const [pendingRecruiters, setPendingRecruiters] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [rules, setRules] = useState(() => {
        const savedRules = localStorage.getItem("placement_rules");
        return savedRules ? JSON.parse(savedRules) : {
            minGlobalCgpa: 6.0,
            oneStudentOneOffer: true,
            blacklistAfterSelection: true,
        };
    });

    useEffect(() => {
        // Load Recruiters
        const users = JSON.parse(localStorage.getItem("recruiter_users") || "[]");
        setPendingRecruiters(users.filter(u => u.status === 'Pending'));

        // Load All Users for Management (Mocking a combined list)
        // In a real app, this would come from a backend
        const students = [{ id: 101, name: "Student User", email: "student@example.com", role: "Student", status: "Active" }]; // Mock student
        
        // Combine and format for the table
        const formattedRecruiters = users.map(r => ({
            id: r.id,
            name: r.companyName,
            email: r.email,
            role: "Recruiter",
            status: r.status === 'Approved' ? 'Active' : (r.status === 'Blocked' ? 'Blocked' : 'Pending')
        }));

        setAllUsers([...students, ...formattedRecruiters]);
    }, [currentView]); // Reload when view changes

    const viewDashboard = () => {
        console.log("Loading Admin Dashboard...");
    };

    const handleApproval = (id, status) => {
        const users = JSON.parse(localStorage.getItem("recruiter_users") || "[]");
        const updatedUsers = users.map(u => {
            if (u.id === id) {
                return { ...u, status: status };
            }
            return u;
        });
        localStorage.setItem("recruiter_users", JSON.stringify(updatedUsers));
        setPendingRecruiters(updatedUsers.filter(u => u.status === 'Pending'));
        toast.success(`Recruiter ${status === 'Approved' ? 'Approved' : 'Rejected'} successfully`);
        
        // Update local allUsers state to reflect change immediately
        setAllUsers(prev => prev.map(u => u.id === id ? { ...u, status: status === 'Approved' ? 'Active' : 'Rejected' } : u));
    };

    const toggleUserStatus = (userId, currentStatus, role) => {
        if (role === 'Recruiter') {
            const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Approved'; // 'Approved' maps to Active in our logic
            const users = JSON.parse(localStorage.getItem("recruiter_users") || "[]");
            const updatedUsers = users.map(u => {
                if (u.id === userId) {
                    return { ...u, status: newStatus };
                }
                return u;
            });
            localStorage.setItem("recruiter_users", JSON.stringify(updatedUsers));
            
            setAllUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, status: newStatus === 'Blocked' ? 'Blocked' : 'Active' } : u
            ));
            toast.success(`User ${newStatus === 'Blocked' ? 'Unblocked' : 'Blocked'} successfully`);
        } else {
            toast("Student blocking not implemented in this demo", { icon: 'ℹ️' });
        }
    };

    const handleRoleChange = (userId, newRole) => {
        // In a real app, this would update the user's role in the DB
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast.success("Role updated successfully");
    };

    const handleRuleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setRules(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveRules = () => {
        localStorage.setItem("placement_rules", JSON.stringify(rules));
        toast.success("Placement rules saved successfully!");
    };

    // Analytics Data (Mock Data for Demonstration)
    const branchData = {
        labels: ['Computer Science', 'IT', 'Electronics', 'Mechanical', 'Civil'],
        datasets: [
            {
                label: 'Placed Students',
                data: [120, 95, 60, 45, 30],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
            },
            {
                label: 'Total Students',
                data: [140, 110, 80, 70, 50],
                backgroundColor: 'rgba(160, 174, 192, 0.3)',
            }
        ],
    };

    const placementData = {
        labels: ['Placed', 'Unplaced', 'Higher Studies'],
        datasets: [
            {
                data: [350, 80, 20],
                backgroundColor: ['#48bb78', '#f56565', '#ecc94b'],
                hoverOffset: 4
            },
        ],
    };

    const companyData = {
        labels: ['Tech Corp', 'Innovate Inc', 'Data Systems', 'Web Solutions', 'Core Engg', 'StartUp Hub'],
        datasets: [
            {
                label: 'Offers Rolled Out',
                data: [45, 30, 25, 20, 15, 10],
                backgroundColor: 'rgba(128, 90, 213, 0.6)',
            },
        ],
    };

    return (
        <div className="portal-container admin-portal">
            <div className="portal-header">
                <h2>{portalName}</h2>
                <div className="header-actions">
                     <button className="action-btn" onClick={() => setCurrentView('analytics')}>Analytics</button>
                     <button className="action-btn" onClick={() => setCurrentView('rule-engine')}>Rule Engine</button>
                     <button className="action-btn" onClick={() => setCurrentView('user-management')}>User Management</button>
                     <button className="action-btn" onClick={() => setCurrentView('dashboard')}>Dashboard</button>
                </div>
            </div>
            
            {currentView === 'dashboard' && (
                <div className="admin-section">
                    <h3>Pending Recruiter Approvals</h3>
                    {pendingRecruiters.length === 0 ? (
                        <p style={{ color: '#718096' }}>No pending requests.</p>
                    ) : (
                        <div className="admin-card-list">
                            {pendingRecruiters.map(recruiter => (
                                <div key={recruiter.id} className="admin-card">
                                    <div className="admin-card-info">
                                        <h4>{recruiter.companyName}</h4>
                                        <p>{recruiter.email}</p>
                                    </div>
                                    <div className="admin-card-actions">
                                        <button onClick={() => handleApproval(recruiter.id, 'Approved')} className="admin-btn btn-approve">Approve</button>
                                        <button onClick={() => handleApproval(recruiter.id, 'Rejected')} className="admin-btn btn-reject">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {currentView === 'user-management' && (
                <div className="admin-section">
                    <h3>User & Role Management</h3>
                    <div className="user-management-table-wrapper">
                        <table className="user-management-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(user => (
                                    <tr key={user.id}>
                                        <td className="user-name">{user.name}</td>
                                        <td className="user-email">{user.email}</td>
                                        <td>
                                            <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="role-select">
                                                <option value="Student">Student</option>
                                                <option value="Recruiter">Recruiter</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`status-badge-admin status-${user.status.toLowerCase()}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td>
                                            {user.role === 'Recruiter' && (
                                                <button 
                                                    onClick={() => toggleUserStatus(user.id, user.status, user.role)}
                                                    className={`admin-btn ${user.status === 'Active' ? 'btn-block' : 'btn-unblock'}`}
                                                >
                                                    {user.status === 'Active' ? 'Block' : 'Unblock'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentView === 'rule-engine' && (
                <div className="admin-section">
                    <h3>Placement Rule Engine</h3>
                    <div className="rule-engine-container">
                        <div className="rule-item">
                            <div className="rule-info">
                                <h4>One Student, One Offer Policy</h4>
                                <p>If enabled, students who have accepted one job offer will not be eligible for other placements.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="oneStudentOneOffer" checked={rules.oneStudentOneOffer} onChange={handleRuleChange} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="rule-item">
                            <div className="rule-info">
                                <h4>Blacklist After Selection</h4>
                                <p>If enabled, students will be automatically blacklisted from further rounds of a company once selected.</p>
                            </div>
                            <label className="toggle-switch">
                                <input type="checkbox" name="blacklistAfterSelection" checked={rules.blacklistAfterSelection} onChange={handleRuleChange} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="rule-item">
                            <div className="rule-info">
                                <h4>Minimum Global CGPA</h4>
                                <p>Set a minimum CGPA required to be eligible for any placement drive.</p>
                            </div>
                            <input type="number" name="minGlobalCgpa" value={rules.minGlobalCgpa} onChange={handleRuleChange} className="rule-input" step="0.1" />
                        </div>
                        <button className="admin-btn btn-approve" style={{marginTop: '1rem', width: '150px'}} onClick={handleSaveRules}>Save Rules</button>
                    </div>
                </div>
            )}

            {currentView === 'analytics' && (
                <div className="admin-section">
                    <h3>Placement Analytics & Dashboard</h3>
                    
                    <div className="stats-overview">
                        <div className="stat-card">
                            <h4>Total Students</h4>
                            <p className="stat-number">450</p>
                        </div>
                        <div className="stat-card">
                            <h4>Placed Students</h4>
                            <p className="stat-number">350</p>
                        </div>
                        <div className="stat-card">
                            <h4>Placement %</h4>
                            <p className="stat-number">77.8%</p>
                        </div>
                        <div className="stat-card">
                            <h4>Avg Package</h4>
                            <p className="stat-number">8.5 LPA</p>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-container">
                            <h4>Branch-wise Placement Stats</h4>
                            <Bar data={branchData} options={{ responsive: true }} />
                        </div>
                        <div className="chart-container">
                            <h4>Placement Status</h4>
                            <div style={{width: '300px', margin: '0 auto'}}>
                                <Doughnut data={placementData} />
                            </div>
                        </div>
                        <div className="chart-container full-width">
                            <h4>Company-wise Hiring</h4>
                            <Bar data={companyData} options={{ responsive: true }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPortal;