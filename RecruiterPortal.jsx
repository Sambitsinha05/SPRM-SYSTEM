import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './RecruiterPortal.css';

const RecruiterPortal = () => {
    // Auth State
    const [isLogin, setIsLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("recruiter_auth") === "true");
    const [formData, setFormData] = useState({
        companyName: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    // Job Management State
    const [currentView, setCurrentView] = useState('dashboard');
    const [jobForm, setJobForm] = useState({
        title: '',
        description: '',
        salary: '',
        experience: '',
        minCgpa: '',
        branches: '',
        rounds: '',
        maxBacklogs: '',
        passOutYear: ''
    });

    // Applicant Management State
    const [applicants, setApplicants] = useState([]);
    const [filters, setFilters] = useState({
        branch: '',
        minCgpa: ''
    });
    const [selectedApplicantProfile, setSelectedApplicantProfile] = useState(null);

    useEffect(() => {
        const allApplications = JSON.parse(localStorage.getItem("all_applications") || "[]");
        const companyName = localStorage.getItem("recruiter_name");
        setApplicants(allApplications.filter(app => app.company === companyName));
    }, [currentView]);

    // Interview Scheduling State
    const [interviewForm, setInterviewForm] = useState({
        date: '',
        time: '',
        mode: 'Online',
        location: ''
    });
    const [selectedApplicantId, setSelectedApplicantId] = useState(null);

    const [portalName] = useState("Recruiter Portal");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        
        const storedUsers = JSON.parse(localStorage.getItem("recruiter_users") || "[]");

        if (isLogin) {
            // Login Logic
            const user = storedUsers.find(u => u.email === formData.email && u.password === formData.password);

            if (user) {
                if (user.status === 'Approved') {
                    localStorage.setItem("recruiter_auth", "true");
                    localStorage.setItem("recruiter_name", user.companyName);
                    setIsAuthenticated(true);
                    toast.success(`Welcome back, ${user.companyName}!`);
                } else if (user.status === 'Pending') {
                    toast.error("Account is pending Admin approval.");
                } else {
                    toast.error("Account access denied.");
                }
            } else {
                toast.error("Invalid credentials or account not found.");
            }
        } else {
            // Register Logic
            if (storedUsers.some(u => u.email === formData.email)) {
                toast.error("Email already registered.");
                return;
            }

            const newUser = {
                ...formData,
                status: 'Pending', // Default status requiring admin approval
                id: Date.now()
            };
            
            storedUsers.push(newUser);
            localStorage.setItem("recruiter_users", JSON.stringify(storedUsers));
            toast.success("Registration successful! Please wait for Admin approval.");
            setIsLogin(true); // Switch to login view
            setFormData({ companyName: '', email: '', password: '' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("recruiter_auth");
        localStorage.removeItem("recruiter_name");
        setIsAuthenticated(false);
        toast.success("Logged out successfully.");
        window.location.reload();
    };

    const handleJobInputChange = (e) => {
        const { name, value } = e.target;
        setJobForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePostJobSubmit = (e) => {
        e.preventDefault();
        const companyName = localStorage.getItem("recruiter_name") || formData.companyName;
        
        const newJob = {
            id: Date.now(),
            company: companyName,
            title: jobForm.title,
            description: jobForm.description,
            salary: jobForm.salary,
            experience: jobForm.experience,
            rounds: jobForm.rounds.split(',').map(r => r.trim()),
            criteria: {
                minCgpa: parseFloat(jobForm.minCgpa),
                branches: jobForm.branches.split(',').map(b => b.trim()),
                maxBacklogs: parseInt(jobForm.maxBacklogs) || 0,
                passOutYear: jobForm.passOutYear.split(',').map(y => parseInt(y.trim()))
            }
        };

        const existingJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
        const updatedJobs = [...existingJobs, newJob];
        localStorage.setItem("posted_jobs", JSON.stringify(updatedJobs));
        
        toast.success("Job Posted Successfully!");
        setJobForm({
            title: '', description: '', salary: '', experience: '', 
            minCgpa: '', branches: '', rounds: '', maxBacklogs: '', passOutYear: ''
        });
        setCurrentView('dashboard');
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    

        
        

    const handleScheduleClick = (applicantId) => {
        setSelectedApplicantId(applicantId);
        setInterviewForm({ date: '', time: '', mode: 'Online', location: '' });
        setCurrentView('schedule-interview');
    };

    const handleInterviewInputChange = (e) => {
        const { name, value } = e.target;
        setInterviewForm(prev => ({ ...prev, [name]: value }));
    };

    const handleScheduleSubmit = (e) => {
        e.preventDefault();
        const applicant = applicants.find(a => a.id === selectedApplicantId);
        
        const allApplications = JSON.parse(localStorage.getItem("all_applications") || "[]");
        const updatedAllApps = allApplications.map(app => 
            app.id === selectedApplicantId ? { 
                ...app, 
                status: 'Interview Scheduled',
                interviewDetails: { ...interviewForm }
            } : app
        );
        localStorage.setItem("all_applications", JSON.stringify(updatedAllApps));

        setApplicants(prev => prev.map(app =>
            app.id === selectedApplicantId ? { 
                ...app, 
                status: 'Interview Scheduled',
                interviewDetails: { ...interviewForm }
            } : app
        ));

        // --- Notification Logic ---
        const allNotifications = JSON.parse(localStorage.getItem("all_notifications") || "[]");
        const newNotification = { id: Date.now(), studentEmail: applicant.studentEmail, message: `Your interview for the ${applicant.title} role at ${applicant.company} has been scheduled.`, timestamp: new Date().toISOString(), isRead: false };
        localStorage.setItem("all_notifications", JSON.stringify([...allNotifications, newNotification]));
        // --- End Notification Logic ---
        toast.success(`Interview scheduled for ${applicant.studentName}. Student has been notified.`);
        setCurrentView('applicant-management');
    };

    if (!isAuthenticated) {
        return (
            <div className="recruiter-auth-wrapper">
                <div className="recruiter-auth-card">
                    <div className="auth-header">
                        <h2>{isLogin ? 'Recruiter Login' : 'Company Registration'}</h2>
                        <p>{isLogin ? 'Access your recruitment dashboard' : 'Register your company to hire top talent'}</p>
                    </div>
                    
                    <form onSubmit={handleAuthSubmit} key={isLogin ? 'login' : 'register'} className="auth-form-animate">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Company Name</label>
                                <input type="text" name="companyName" placeholder="Tech Corp Inc." value={formData.companyName} onChange={handleInputChange} required />
                            </div>
                        )}
                        <div className="form-group">
                            <label>Work Email</label>
                            <input type="email" name="email" placeholder="hr@company.com" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? "text" : "password"} name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required />
                                <button 
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="submit-btn">{isLogin ? 'Sign In' : 'Register Company'}</button>
                    </form>

                    <div className="toggle-auth">
                        {isLogin ? "New to the platform?" : "Already registered?"}
                        <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Register here' : 'Login here'}</button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'post-job') {
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Post a New Job</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>
                <form className="recruiter-auth-card" style={{maxWidth: '800px', margin: '0 auto'}} onSubmit={handlePostJobSubmit}>
                    <div className="form-group">
                        <label>Job Role / Title</label>
                        <select name="title" value={jobForm.title} onChange={handleJobInputChange} required>
                            <option value="">Select Job Role</option>
                            <option value="Software Engineer">Software Engineer</option>
                            <option value="Frontend Developer">Frontend Developer</option>
                            <option value="Backend Developer">Backend Developer</option>
                            <option value="Full Stack Developer">Full Stack Developer</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Data Analyst">Data Analyst</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="UI/UX Designer">UI/UX Designer</option>
                            <option value="QA Engineer">QA Engineer</option>
                            <option value="DevOps Engineer">DevOps Engineer</option>
                            <option value="Business Analyst">Business Analyst</option>
                            <option value="HR Manager">HR Manager</option>
                            <option value="Marketing Specialist">Marketing Specialist</option>
                            <option value="Sales Executive">Sales Executive</option>
                            <option value="Content Writer">Content Writer</option>
                            <option value="Graphic Designer">Graphic Designer</option>
                            <option value="System Administrator">System Administrator</option>
                            <option value="Network Engineer">Network Engineer</option>
                            <option value="Mobile App Developer">Mobile App Developer</option>
                            <option value="Cloud Architect">Cloud Architect</option>
                            <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                            <option value="AI/ML Engineer">AI/ML Engineer</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Job Description</label>
                        <input type="text" name="description" value={jobForm.description} onChange={handleJobInputChange} placeholder="Brief description of the role" required />
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                            <label>Salary Package (LPA)</label>
                            <input type="text" name="salary" value={jobForm.salary} onChange={handleJobInputChange} placeholder="e.g. 12 LPA" required />
                        </div>
                        <div className="form-group">
                            <label>Experience Required</label>
                            <input type="text" name="experience" value={jobForm.experience} onChange={handleJobInputChange} placeholder="e.g. 0-2 Years" required />
                        </div>
                    </div>
                    
                    <h3 style={{color: '#2f855a', marginTop: '1.5rem', marginBottom: '1rem'}}>Eligibility Criteria</h3>
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                        <div className="form-group">
                            <label>Minimum CGPA</label>
                            <input type="number" step="0.1" name="minCgpa" value={jobForm.minCgpa} onChange={handleJobInputChange} placeholder="e.g. 7.0" required />
                        </div>
                        <div className="form-group">
                            <label>Max Backlogs Allowed</label>
                            <input type="number" name="maxBacklogs" value={jobForm.maxBacklogs} onChange={handleJobInputChange} placeholder="e.g. 0" required />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Eligible Branches</label>
                        <select name="branches" value={jobForm.branches} onChange={handleJobInputChange} required>
                            <option value="">Select Branch</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                            <option value="Electrical Engineering">Electrical Engineering</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                            <option value="Civil Engineering">Civil Engineering</option>
                            <option value="Chemical Engineering">Chemical Engineering</option>
                            <option value="Aerospace Engineering">Aerospace Engineering</option>
                            <option value="Biotechnology">Biotechnology</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Eligible Passout Years (Comma separated)</label>
                        <input type="text" name="passOutYear" value={jobForm.passOutYear} onChange={handleJobInputChange} placeholder="2024, 2025" required />
                    </div>

                    <div className="form-group">
                        <label>Hiring Rounds (Comma separated)</label>
                        <input type="text" name="rounds" value={jobForm.rounds} onChange={handleJobInputChange} placeholder="Aptitude Test, Coding Round, Technical Interview, HR" required />
                    </div>

                    <button type="submit" className="submit-btn">Post Job</button>
                </form>
            </div>
        );
    }

    if (currentView === 'applicant-management') {
        const filteredApplicants = applicants.filter(app => {
            const matchBranch = filters.branch ? app.studentProfile.branch === filters.branch : true;
            const matchCgpa = filters.minCgpa ? app.studentProfile.cgpa >= parseFloat(filters.minCgpa) : true;
            return matchBranch && matchCgpa;
        });

        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Applicant Management</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>

                <div className="applicant-filters">
                    <div className="filter-group">
                        <label>Filter by Branch</label>
                        <select name="branch" value={filters.branch} onChange={handleFilterChange}>
                            <option value="">All Branches</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Information Technology">Information Technology</option>
                            <option value="Electronics & Communication">Electronics & Communication</option>
                            <option value="Mechanical Engineering">Mechanical Engineering</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Min CGPA</label>
                        <input type="number" name="minCgpa" value={filters.minCgpa} onChange={handleFilterChange} placeholder="e.g. 7.0" step="0.1" />
                    </div>
                </div>

                <div className="applicant-grid">
                    {filteredApplicants.length === 0 ? (
                        <p className="no-data">No applicants found matching criteria.</p>
                    ) : (
                        filteredApplicants.map(app => (
                            <div key={app.id} className="applicant-card">
                                <div className="applicant-info">
                                    <h3>{app.studentName}</h3>
                                    <span className={`status-badge status-${app.status.toLowerCase().replace(/\s+/g, '-')}`}>{app.status}</span>
                                </div>
                                <div className="applicant-details">
                                    <p><strong>Applied for:</strong> {app.title}</p>
                                    <p><strong>Branch:</strong> {app.studentProfile.branch}</p>
                                    <p><strong>CGPA:</strong> {app.studentProfile.cgpa} | <strong>Year:</strong> {app.studentProfile.passOutYear}</p>
                                </div>
                                <div className="applicant-actions">
                                    {app.status !== 'Shortlisted' && app.status !== 'Rejected' && (
                                        <>
                                            <button className="action-btn-sm btn-shortlist" onClick={() => updateApplicantStatus(app.id, 'Shortlisted')}>Shortlist</button>
                                            <button className="action-btn-sm btn-reject" onClick={() => updateApplicantStatus(app.id, 'Rejected')}>Reject</button>                                           
                                        </>
                                    )}
                                    {app.status === 'Shortlisted' && (
                                        <>
                                            <button className="action-btn-sm btn-schedule" onClick={() => handleScheduleClick(app.id)}>Schedule Interview</button>
                                            <button className="action-btn-sm btn-reject" onClick={() => updateApplicantStatus(app.id, 'Rejected')}>Reject</button>
                                        </>
                                    )}
                                    {app.status === 'Interview Scheduled' && (
                                        <>
                                            <button className="action-btn-sm btn-offer" onClick={() => updateApplicantStatus(app.id, 'Offer Extended')}>Extend Offer</button>
                                            <button className="action-btn-sm btn-reject" onClick={() => updateApplicantStatus(app.id, 'Rejected')}>Reject</button>
                                        </>
                                    )}
                                    {app.status === 'Rejected' && (
                                        <button className="action-btn-sm btn-shortlist" onClick={() => updateApplicantStatus(app.id, 'Shortlisted')}>Reconsider</button>
                                    )}
                                    <button className="action-btn-sm btn-view" onClick={() => setSelectedApplicantProfile(app.studentProfile)}>View Profile</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    if (selectedApplicantProfile) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h2>Student Profile</h2>
                        <button className="modal-close-btn" onClick={() => setSelectedApplicantProfile(null)}>×</button>
                    </div>
                    <div className="profile-grid">
                        <p><strong>Full Name:</strong> {selectedApplicantProfile.fullName}</p>
                        <p><strong>Email:</strong> {selectedApplicantProfile.email}</p>
                        <p><strong>Phone:</strong> {selectedApplicantProfile.phone || 'N/A'}</p>
                        <p><strong>College:</strong> {selectedApplicantProfile.collegeName || 'N/A'}</p>
                        <p><strong>Branch:</strong> {selectedApplicantProfile.branch || 'N/A'}</p>
                        <p><strong>CGPA:</strong> {selectedApplicantProfile.cgpa || 'N/A'}</p>
                        <p><strong>Passout Year:</strong> {selectedApplicantProfile.passOutYear || 'N/A'}</p>
                        <p><strong>Backlogs:</strong> {selectedApplicantProfile.backlogs || '0'}</p>
                    </div>
                    <div className="profile-section">
                        <p><strong>Skills:</strong> {selectedApplicantProfile.skills || 'N/A'}</p>
                        <p><strong>Certifications:</strong> {selectedApplicantProfile.certifications || 'N/A'}</p>
                        <p><strong>Resume:</strong> {selectedApplicantProfile.resumeName ? <a href="#">{selectedApplicantProfile.resumeName}</a> : 'Not Uploaded'}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (currentView === 'scheduled-interviews') {
        const scheduledApplicants = applicants.filter(app => app.status === 'Interview Scheduled');

        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Scheduled Interviews</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>

                <div className="applicant-grid">
                    {scheduledApplicants.length === 0 ? (
                        <p className="no-data">No interviews scheduled yet.</p>
                    ) : (
                        scheduledApplicants.map(app => (
                            <div key={app.id} className="applicant-card" style={{borderLeft: '4px solid #805ad5'}}>
                                <div className="applicant-info">
                                    <h3>{app.studentName}</h3>
                                    <span className="status-badge status-interview-scheduled">Scheduled</span>
                                </div>
                                <div className="applicant-details">
                                    <p><strong>Role:</strong> {app.jobTitle}</p>
                                    <div style={{marginTop: '0.5rem', padding: '0.5rem', background: '#f7fafc', borderRadius: '6px'}}>
                                        <p><strong>Date:</strong> {app.interviewDetails?.date}</p>
                                        <p><strong>Time:</strong> {app.interviewDetails?.time}</p>
                                        <p><strong>Mode:</strong> {app.interviewDetails?.mode}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    if (currentView === 'schedule-interview') {
        const applicant = applicants.find(a => a.id === selectedApplicantId);
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Schedule Interview</h2>
                    <button onClick={() => setCurrentView('applicant-management')} className="action-btn">Back</button>
                </div>
                <div className="recruiter-auth-card" style={{maxWidth: '600px', margin: '0 auto'}}>
                    <h3 style={{color: '#2d3748', marginBottom: '0.5rem'}}>Interview for {applicant?.studentName}</h3>
                    <p style={{color: '#718096', marginBottom: '1.5rem'}}>Role: {applicant?.title}</p>
                    
                    <form onSubmit={handleScheduleSubmit}>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={interviewForm.date} onChange={handleInterviewInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input type="time" name="time" value={interviewForm.time} onChange={handleInterviewInputChange} required />
                        </div>
                        <div className="form-group">
                            <label>Mode</label>
                            <select name="mode" value={interviewForm.mode} onChange={handleInterviewInputChange}>
                                <option value="Online">Online (Video Call)</option>
                                <option value="Offline">Offline (In-Person)</option>
                                <option value="Telephonic">Telephonic</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{interviewForm.mode === 'Online' ? 'Meeting Link' : 'Venue Address'}</label>
                            <input type="text" name="location" value={interviewForm.location} onChange={handleInterviewInputChange} placeholder={interviewForm.mode === 'Online' ? 'https://meet.google.com/...' : 'Office Address'} required />
                        </div>
                        <button type="submit" className="submit-btn">Confirm Schedule</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="portal-container">
            <div className="portal-header">
                <h2>{portalName}</h2>
                <div className="header-actions">
                    <button className="create-job-btn" onClick={() => setCurrentView('post-job')}>+ Post New Job</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            <div className="dashboard-content">
                <p>Welcome, {localStorage.getItem("recruiter_name")}!</p>

                <div style={{marginTop: '2rem'}}>
                    <button className="manage-applicants-btn" onClick={() => setCurrentView('applicant-management')}>Manage Applicants</button>
                    <button className="manage-applicants-btn" style={{background: 'linear-gradient(135deg, #805ad5 0%, #6b46c1 100%)', boxShadow: '0 4px 6px rgba(128, 90, 213, 0.2)'}} onClick={() => setCurrentView('scheduled-interviews')}>View Scheduled Interviews</button>
                    <h3>Your Posted Jobs</h3>
                    <p style={{color: '#718096'}}>
                        {JSON.parse(localStorage.getItem("posted_jobs") || "[]").length === 0 
                            ? "No jobs posted yet." 
                            : `You have posted ${JSON.parse(localStorage.getItem("posted_jobs") || "[]").length} jobs.`}
                    </p>
                </div>
            </div>
        </div>
    );

}
export default RecruiterPortal;