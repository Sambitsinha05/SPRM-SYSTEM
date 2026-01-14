
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './StudentPortal.css';

const StudentPortal = () => {
    // Auth State
    const [isLogin, setIsLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem("student_auth") === "true");
    const [formData, setFormData] = useState({
        fullName: localStorage.getItem("student_name") || '',
        email: localStorage.getItem("student_email") || '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    // Profile Management State
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'profile'
    const [profileData, setProfileData] = useState({
        phone: '',
        address: '',
        collegeName: '',
        branch: '',
        currentYear: '',
        passOutYear: '',
        cgpa: '',
        backlogs: '',
        skills: '',
        certifications: ''
    });
    const [resumeName, setResumeName] = useState('');
    const [certificationName, setCertificationName] = useState('');
    const [applications, setApplications] = useState(() => {
        const allApps = JSON.parse(localStorage.getItem("all_applications") || "[]");
        const studentEmail = localStorage.getItem("student_email");
        return allApps.filter(app => app.studentEmail === studentEmail);
    });

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    // IDE State
    const [ideTheme, setIdeTheme] = useState('dark');
    const [ideLanguage, setIdeLanguage] = useState('javascript');

    // Test Selection State
    const [selectedCategory, setSelectedCategory] = useState(null);

    // ATS State
    const [atsFile, setAtsFile] = useState(null);
    const [atsResult, setAtsResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Online Test State
    const [testState, setTestState] = useState({
        isActive: false,
        currentQuestion: 0,
        answers: {}, // { questionId: optionIndex }
        code: '', // For coding test
        output: '', // For coding test
        timeLeft: 0, // in seconds
        isSubmitted: false,
        score: 0,
        warnings: 0
    });

    const mcqData = {
        verbal: [
            { id: 1, question: "Choose the synonym of: ABANDON", options: ["Keep", "Cherish", "Forsake", "Join"], correct: 2 },
            { id: 2, question: "Antonym of: BRAVE", options: ["Cowardly", "Bold", "Courageous", "Daring"], correct: 0 },
            { id: 3, question: "Complete the idiom: A blessing in ____", options: ["sky", "disguise", "sand", "time"], correct: 1 },
            { id: 4, question: "Find the correctly spelt word.", options: ["Accomodation", "Accommodation", "Acommodation", "Acomodation"], correct: 1 },
            { id: 5, question: "One who knows everything is called?", options: ["Omnipresent", "Omnipotent", "Omniscient", "Optimist"], correct: 2 }
        ],
        logical: [
            { id: 1, question: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", options: ["(1/3)", "(1/8)", "(2/8)", "(1/16)"], correct: 1 },
            { id: 2, question: "SCD, TEF, UGH, ____, WKL", options: ["CMN", "UJI", "VIJ", "IJT"], correct: 2 },
            { id: 3, question: "Statement: All mangoes are golden in colour. No golden-coloured things are cheap.\nConclusion: All mangoes are cheap.", options: ["True", "False", "Probably True", "Irrelevant"], correct: 1 },
            { id: 4, question: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His Son", "His Father", "His Nephew"], correct: 1 },
            { id: 5, question: "Which word does NOT belong with the others?", options: ["Index", "Glossary", "Chapter", "Book"], correct: 3 }
        ],
        cs: [
            { id: 1, question: "What is the time complexity of Binary Search?", options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], correct: 1 },
            { id: 2, question: "Which hook is used for side effects in React?", options: ["useState", "useReducer", "useEffect", "useMemo"], correct: 2 },
            { id: 3, question: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 0 },
            { id: 4, question: "Which data structure follows LIFO?", options: ["Queue", "Stack", "Array", "Tree"], correct: 1 },
            { id: 5, question: "What is the default port for React dev server?", options: ["3000", "8080", "5000", "4200"], correct: 0 }
        ],
        quant: [
            { id: 1, question: "What is the average of first 150 natural numbers?", options: ["70", "70.5", "75", "75.5"], correct: 3 },
            { id: 2, question: "If a = 2b and 4b = 8c, then a = ?", options: ["2c", "4c", "8c", "16c"], correct: 1 },
            { id: 3, question: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", options: ["120 metres", "180 metres", "324 metres", "150 metres"], correct: 3 },
            { id: 4, question: "The sum of ages of 5 children born at the intervals of 3 years each is 50 years. What is the age of the youngest child?", options: ["4 years", "8 years", "10 years", "None of these"], correct: 0 },
            { id: 5, question: "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:", options: ["588 apples", "600 apples", "672 apples", "700 apples"], correct: 3 }
        ]
    };

    const codingQuestions = [
        { 
            id: 1, 
            title: "Two Sum", 
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]",
            starterCodes: {
                javascript: "function twoSum(nums, target) {\n  // Write your code here\n  \n}",
                python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
                java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}",
                cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};"
            }
        },
        { 
            id: 2, 
            title: "Reverse String", 
            description: "Write a function that reverses a string. The input string is given as an array of characters s.",
            example: "Input: s = ['h','e','l','l','o']\nOutput: ['o','l','l','e','h']",
            starterCodes: {
                javascript: "function reverseString(s) {\n  // Write your code here\n  \n}",
                python: "def reverseString(s):\n    # Write your code here\n    pass",
                java: "class Solution {\n    public void reverseString(char[] s) {\n        // Write your code here\n    }\n}",
                cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        // Write your code here\n    }\n};"
            }
        }
    ];

    // Dashboard State
    const [portalName] = useState("Student Portal");

    // Mock Jobs Data
    const [availableJobs, setAvailableJobs] = useState(() => {
        const hardcodedJobs = [{
            id: 101,
            company: "Tech Solutions Inc.",
            title: "Junior Software Developer",
            description: "Looking for a React developer with strong problem-solving skills.",
            criteria: {
                minCgpa: 7.0,
                branches: ["Computer Science", "Information Technology", "Electronics"],
                maxBacklogs: 0,
                passOutYear: [2024, 2025]
            }
        },
        {
            id: 102,
            company: "Data Corp",
            title: "Data Analyst",
            description: "Python and SQL knowledge required. Open to all engineering branches.",
            criteria: {
                minCgpa: 6.5,
                branches: ["Computer Science", "Information Technology", "Mechanical", "Civil", "Electronics"],
                maxBacklogs: 1,
                passOutYear: [2024, 2025]
            }
        },
        {
            id: 103,
            company: "Core Engineering Ltd.",
            title: "Mechanical Engineer",
            description: "Core mechanical concepts and CAD software proficiency.",
            criteria: {
                minCgpa: 6.0,
                branches: ["Mechanical"],
                maxBacklogs: 2,
                passOutYear: [2023, 2024, 2025]
            }
        }];
        const postedJobs = JSON.parse(localStorage.getItem("posted_jobs") || "[]");
        return [...hardcodedJobs, ...postedJobs];
    });

    useEffect(() => {
        const studentEmail = localStorage.getItem("student_email");
        if (isAuthenticated && studentEmail) {
            const allNotifications = JSON.parse(localStorage.getItem("all_notifications") || "[]");
            const userNotifications = allNotifications.filter(n => n.studentEmail === studentEmail);
            setNotifications(userNotifications.reverse());
        }
    }, [isAuthenticated]);

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        // Simple date format
        return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf") {
                setResumeName(file.name);
            } else {
                alert("Please upload a PDF file.");
                e.target.value = null;
            }
        }
    };

    const handleCertificationFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                setCertificationName(file.name);
            } else {
                alert("Please upload a PDF or Image file.");
                e.target.value = null;
            }
        }
    };

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        // Simulate authentication
        console.log(isLogin ? "Logging in..." : "Registering...", formData);
        
        let finalName = formData.fullName;

        if (isLogin && !formData.fullName) {
            finalName = "Student User";
            setFormData(prev => ({
                ...prev,
                fullName: finalName
            }));
        }
        
        localStorage.setItem("student_auth", "true");
        localStorage.setItem("student_name", finalName);
        localStorage.setItem("student_email", formData.email);
        toast.success(isLogin ? "Successfully logged in!" : "Account created successfully!");
        setIsAuthenticated(true);
    };

    const viewDashboard = () => {
        console.log("Loading Student Dashboard...");
    };

    const applyForJob = (jobId) => {
        const job = availableJobs.find(j => j.id === jobId);
        if (!job) return;

        const allApplications = JSON.parse(localStorage.getItem("all_applications") || "[]");
        const alreadyApplied = allApplications.some(app => app.jobId === jobId && app.studentEmail === formData.email);
        if (alreadyApplied) {
            toast.error("You have already applied for this job!");
            return;
        }

        const newApp = {
            id: Date.now(),
            jobId: job.id,
            company: job.company,
            title: job.title,
            status: "Applied",
            appliedDate: new Date().toLocaleDateString(),
            // Student Info for Recruiter
            studentEmail: formData.email,
            studentName: formData.fullName,
            studentProfile: {
                ...profileData,
                fullName: formData.fullName,
                email: formData.email,
                resumeName: resumeName,
                certificationName: certificationName
            }
        };

        const updatedAllApps = [...allApplications, newApp];
        localStorage.setItem("all_applications", JSON.stringify(updatedAllApps));
        setApplications(prev => [newApp, ...prev]); // Update UI immediately
        toast.success("Application submitted successfully!");
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        console.log("Saving Profile Data:", { ...formData, ...profileData, resumeName, certificationName });
        setCurrentView('dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem("student_auth");
        localStorage.removeItem("student_name");
        localStorage.removeItem("student_email");
        toast.success("Logged out successfully!");
        window.location.reload();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Applied': return 'status-applied';
            case 'Shortlisted': return 'status-shortlisted';
            case 'Test Scheduled': return 'status-test';
            case 'Selected': return 'status-selected';
            case 'Offer Extended': return 'status-selected';
            case 'Rejected': return 'status-rejected';
            case 'Interview Scheduled': return 'status-interview';
            default: return 'status-applied';
        }
    };

    const markAllAsRead = () => {
        const studentEmail = localStorage.getItem("student_email");
        const allNotifications = JSON.parse(localStorage.getItem("all_notifications") || "[]");
        
        const updatedAll = allNotifications.map(n => 
            n.studentEmail === studentEmail ? { ...n, isRead: true } : n
        );
        localStorage.setItem("all_notifications", JSON.stringify(updatedAll));

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const checkEligibility = (job) => {
        const reasons = [];
        
        // Parse profile data (default to 0 or empty if not set)
        const userCgpa = parseFloat(profileData.cgpa) || 0;
        const userBacklogs = profileData.backlogs === '' ? -1 : parseInt(profileData.backlogs); // -1 indicates not set
        const userYear = parseInt(profileData.passOutYear) || 0;
        const userBranch = profileData.branch || "";

        // Check CGPA
        if (userCgpa < job.criteria.minCgpa) {
            reasons.push(`Required CGPA: ${job.criteria.minCgpa} (Yours: ${userCgpa})`);
        }

        // Check Backlogs
        if (userBacklogs === -1) {
             reasons.push("Backlogs info missing in profile");
        } else if (userBacklogs > job.criteria.maxBacklogs) {
            reasons.push(`Max Backlogs allowed: ${job.criteria.maxBacklogs} (Yours: ${userBacklogs})`);
        }

        // Check Branch (Simple includes check)
        const isBranchEligible = job.criteria.branches.some(b => 
            userBranch.toLowerCase().includes(b.toLowerCase())
        );
        if (!userBranch) reasons.push("Branch info missing in profile");
        else if (!isBranchEligible) reasons.push(`Allowed Branches: ${job.criteria.branches.join(", ")}`);

        // Check Passing Year
        if (!job.criteria.passOutYear.includes(userYear)) {
            reasons.push(`Eligible Batches: ${job.criteria.passOutYear.join(", ")}`);
        }

        return { isEligible: reasons.length === 0, reasons };
    };

    // ATS Functions
    const handleAtsFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === "application/pdf") {
                setAtsFile(file);
                setAtsResult(null);
            } else {
                toast.error("Please upload a PDF file.");
                e.target.value = null;
            }
        }
    };

    const analyzeResume = () => {
        if (!atsFile) {
            toast.error("Please upload a resume first.");
            return;
        }
        setIsAnalyzing(true);
        setTimeout(() => {
            const score = Math.floor(Math.random() * (95 - 65) + 65); // Mock score
            setAtsResult({ score });
            setIsAnalyzing(false);
            toast.success("Resume Analysis Complete!");
        }, 2000);
    };

    // Test Functions
    const openTestSelection = () => {
        setCurrentView('test-selection');
    };

    const startMcqTest = (category) => {
        setSelectedCategory(category);
        setTestState({
            isActive: true,
            currentQuestion: 0,
            answers: {},
            timeLeft: 600, // 10 minutes
            isSubmitted: false,
            score: 0,
            warnings: 0
        });
        setCurrentView('mcq-test');
        toast.success(`${category.toUpperCase()} Test Started!`);
    };

    const startCodingTest = () => {
        setSelectedCategory('coding');
        setIdeLanguage('javascript');
        setIdeTheme('dark');
        setTestState({
            isActive: true,
            currentQuestion: 0,
            answers: {},
            code: codingQuestions[0].starterCodes['javascript'],
            output: '',
            timeLeft: 1800, // 30 minutes
            isSubmitted: false,
            score: 0,
            warnings: 0
        });
        setCurrentView('coding-test');
        toast.success("Coding Test Started!");
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        if (testState.isSubmitted) return;
        setTestState(prev => ({
            ...prev,
            answers: { ...prev.answers, [questionId]: optionIndex }
        }));
    };

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setIdeLanguage(lang);
        const currentQ = codingQuestions[testState.currentQuestion];
        setTestState(prev => ({ ...prev, code: currentQ.starterCodes[lang] }));
    };

    const handleThemeChange = (e) => {
        setIdeTheme(e.target.value);
    };

    const handleCodeChange = (e) => {
        const newCode = e.target.value;
        setTestState(prev => ({ ...prev, code: newCode }));
    };

    const runCode = () => {
        setTestState(prev => ({ ...prev, output: "Compiling and Executing..." }));
        setTimeout(() => {
            let output = "";
            const currentQ = codingQuestions[testState.currentQuestion];
            const starterCode = currentQ.starterCodes[ideLanguage];
            const userCode = testState.code;

            // Check if code is empty or unchanged
            if (!userCode || userCode.trim() === starterCode.trim()) {
                output = "Output:\nNo code changes detected. Please implement the solution.\n\nTest Cases Passed: 0/3";
            } else if (ideLanguage === 'javascript') {
                try {
                    // Syntax check for JS
                    new Function(userCode);
                    
                    // Mock logic check: simple heuristic (length check + keyword check)
                    if (userCode.length < starterCode.length + 15 || !userCode.includes('return')) {
                         output = "Output:\nundefined\n\nTest Results:\nTest Case 1: Failed (Expected value, got undefined)\nTest Case 2: Failed\nTest Case 3: Failed\n\nTest Cases Passed: 0/3";
                    } else {
                        output = "Output:\n[0, 1]\n\nTest Results:\nTest Case 1: Passed\nTest Case 2: Passed\nTest Case 3: Passed\n\nTest Cases Passed: 3/3\nExecution Time: 45ms";
                    }
                } catch (e) {
                    output = `Syntax Error:\n${e.message}\n\nTest Cases Passed: 0/3`;
                }
            } else {
                // For other languages, mock based on length
                if (userCode.length < starterCode.length + 20) {
                    output = `Compilation Error:\nIncomplete implementation or syntax error.\n\nTest Cases Passed: 0/3`;
                } else {
                    output = `Output:\n[0, 1]\n\nTest Results:\nTest Case 1: Passed\nTest Case 2: Passed\nTest Case 3: Passed\n\nTest Cases Passed: 3/3\nExecution Time: 52ms`;
                }
            }

            setTestState(prev => ({ ...prev, output: output }));
        }, 1000);
    };

    const calculateScore = (answers) => {
        if (selectedCategory === 'coding') return 0; // Manual evaluation for coding
        let score = 0;
        const questions = mcqData[selectedCategory] || [];
        questions.forEach((q) => {
            if (answers[q.id] === q.correct) {
                score++;
            }
        });
        return score;
    };

    const submitTest = () => {
        setTestState(prev => {
            const score = calculateScore(prev.answers);
            const total = selectedCategory === 'coding' ? 'Pending Eval' : mcqData[selectedCategory].length;
            toast.success(`Test Submitted! Score: ${score}/${total}`);
            return {
                ...prev,
                isActive: false,
                isSubmitted: true,
                score: score
            };
        });
    };

    // Timer Effect
    useEffect(() => {
        let timer;
        if (testState.isActive && !testState.isSubmitted && testState.timeLeft > 0) {
            timer = setInterval(() => {
                setTestState(prev => {
                    if (prev.timeLeft <= 1) {
                        clearInterval(timer);
                        const score = calculateScore(prev.answers);
                        toast("Time's up! Test Auto-Submitted.", { icon: 'cx' });
                        return { ...prev, timeLeft: 0, isActive: false, isSubmitted: true, score: score };
                    }
                    return { ...prev, timeLeft: prev.timeLeft - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [testState.isActive, testState.isSubmitted]);

    // Anti-Cheat (Tab Switch) Effect
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && testState.isActive && !testState.isSubmitted) {
                setTestState(prev => {
                    const newWarnings = prev.warnings + 1;
                    if (newWarnings >= 2) {
                        const score = calculateScore(prev.answers);
                        toast.error("Test Auto-Submitted due to multiple tab switches!");
                        return { ...prev, warnings: newWarnings, isActive: false, isSubmitted: true, score: score };
                    } else {
                        toast.error(`Warning! Tab switching is not allowed. (${newWarnings}/2)`);
                        return { ...prev, warnings: newWarnings };
                    }
                });
            }
        };

        if (testState.isActive && !testState.isSubmitted) {
            document.addEventListener("visibilitychange", handleVisibilityChange);
        }
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [testState.isActive, testState.isSubmitted]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Render Auth Screen
    if (!isAuthenticated) {
        return (
            <div className="student-auth-wrapper">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Login to access your student portal' : 'Register to start your placement journey'}</p>
                    </div>
                    
                    <form onSubmit={handleAuthSubmit} key={isLogin ? 'login' : 'register'} className="auth-form-animate">
                        {!isLogin && (
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    name="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required={!isLogin}
                                />
                            </div>
                        )}
                        
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                name="email"
                                placeholder="student@university.edu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-wrapper">
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <button 
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
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

                        <button type="submit" className="submit-btn">
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="toggle-auth">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Register here' : 'Login here'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Profile Management
    if (currentView === 'profile') {
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <div className="profile-header-left">
                        <div className="profile-logo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        </div>
                        <h2>My Profile</h2>
                    </div>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>
                
                <form className="profile-form" onSubmit={handleSaveProfile}>
                    {/* Personal Details */}
                    <div className="profile-section">
                        <h3>Personal Details</h3>
                        <div className="profile-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="text" value={formData.email} disabled className="disabled-input" />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="+91 98765 43210" />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <select name="address" value={profileData.address} onChange={handleProfileChange}>
                                    <option value="">Select City</option>
                                    <option value="Mumbai, Maharashtra">Mumbai, Maharashtra</option>
                                    <option value="Delhi, New Delhi">Delhi, New Delhi</option>
                                    <option value="Bangalore, Karnataka">Bangalore, Karnataka</option>
                                    <option value="Hyderabad, Telangana">Hyderabad, Telangana</option>
                                    <option value="Chennai, Tamil Nadu">Chennai, Tamil Nadu</option>
                                    <option value="Kolkata, West Bengal">Kolkata, West Bengal</option>
                                    <option value="Pune, Maharashtra">Pune, Maharashtra</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Academic Details */}
                    <div className="profile-section">
                        <h3>Academic Details</h3>
                        <div className="profile-grid">
                            <div className="form-group">
                                <label>College Name</label>
                                <input type="text" name="collegeName" value={profileData.collegeName} onChange={handleProfileChange} placeholder="University Name" />
                            </div>
                            <div className="form-group">
                                <label>Branch / Stream</label>
                                <input type="text" name="branch" value={profileData.branch} onChange={handleProfileChange} placeholder="e.g. Computer Science" />
                            </div>
                            <div className="form-group">
                                <label>Current Year</label>
                                <select name="currentYear" value={profileData.currentYear} onChange={handleProfileChange}>
                                    <option value="">Select Year</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>CGPA</label>
                                <input type="number" step="0.01" name="cgpa" value={profileData.cgpa} onChange={handleProfileChange} placeholder="e.g. 8.5" />
                            </div>
                            <div className="form-group">
                                <label>Active Backlogs</label>
                                <input type="number" name="backlogs" value={profileData.backlogs} onChange={handleProfileChange} placeholder="0" />
                            </div>
                            <div className="form-group">
                                <label>Pass Out Year</label>
                                <input type="number" name="passOutYear" value={profileData.passOutYear} onChange={handleProfileChange} placeholder="e.g. 2025" />
                            </div>
                        </div>
                    </div>

                    {/* Skills & Resume */}
                    <div className="profile-section">
                        <h3>Skills & Documents</h3>
                        <div className="form-group">
                            <label>Skills (Comma separated)</label>
                            <input type="text" name="skills" value={profileData.skills} onChange={handleProfileChange} placeholder="Java, React, Python, SQL" />
                        </div>
                        <div className="form-group">
                            <label>Certifications</label>
                            <input type="text" name="certifications" value={profileData.certifications} onChange={handleProfileChange} placeholder="AWS Certified, Google Cloud..." />
                            <div className="file-upload-wrapper" style={{ marginTop: '0.5rem' }}>
                                <input type="file" accept=".pdf,image/*" onChange={handleCertificationFileChange} />
                                {certificationName && <span className="file-name">Selected: {certificationName}</span>}
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Upload Resume (PDF only)</label>
                            <div className="file-upload-wrapper">
                                <input type="file" accept=".pdf" onChange={handleFileChange} />
                                {resumeName && <span className="file-name">Selected: {resumeName}</span>}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-btn save-profile-btn">Save Profile</button>
                </form>
            </div>
        );
    }

    // Render Applications View
    if (currentView === 'applications') {
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>My Applications</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>

                <div className="applications-list">
                    {applications.length === 0 ? (
                        <p className="no-data">You haven't applied to any jobs yet.</p>
                    ) : (
                        applications.map(app => (
                            <div key={app.id} className="application-card">
                                <div className="app-header">
                                    <div>
                                        <h3>{app.company}</h3>
                                        <p>{app.title}</p>
                                    </div>
                                    <span className={`status-badge ${getStatusColor(app.status)}`}>{app.status}</span>
                                </div>
                                <div className="app-footer">
                                    <small>Applied on: {app.appliedDate}</small>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // Render Test Selection
    if (currentView === 'test-selection') {
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Select Test Category</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>
                <div className="test-selection-grid">
                    <div className="test-category-card" onClick={() => startMcqTest('verbal')}>
                        <h3>Verbal Ability</h3>
                        <p>Grammar, Vocabulary, Comprehension</p>
                    </div>
                    <div className="test-category-card" onClick={() => startMcqTest('logical')}>
                        <h3>Logical Reasoning</h3>
                        <p>Puzzles, Series, Deductions</p>
                    </div>
                    <div className="test-category-card" onClick={() => startMcqTest('cs')}>
                        <h3>CS Fundamentals</h3>
                        <p>OS, DBMS, CN, OOPs</p>
                    </div>
                    <div className="test-category-card" onClick={() => startMcqTest('quant')}>
                        <h3>Quantitative Aptitude</h3>
                        <p>Maths, Algebra, Arithmetic</p>
                    </div>
                    <div className="test-category-card coding-category" onClick={startCodingTest}>
                        <h3>Coding Test</h3>
                        <p>DSA, Algorithms (IDE Enabled)</p>
                    </div>
                </div>
            </div>
        );
    }

    // Render MCQ Test Module
    if (currentView === 'mcq-test') {
        const questions = mcqData[selectedCategory] || [];
        const currentQ = questions[testState.currentQuestion];
        
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>Online Practice Test</h2>
                    {!testState.isSubmitted && (
                        <div className={`timer-display ${testState.timeLeft < 60 ? 'timer-warning' : ''}`}>
                            Time Left: {formatTime(testState.timeLeft)}
                        </div>
                    )}
                    {testState.isSubmitted && (
                        <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                    )}
                </div>

                {testState.isSubmitted ? (
                    <div className="result-card">
                        <h3>Test Result</h3>
                        <div className="score-display">
                            <span className="score-number">{testState.score}</span>
                            <span className="score-total">/ {questions.length}</span>
                        </div>
                        <p>{testState.score >= questions.length * 0.6 ? "Great job! You passed." : "Keep practicing to improve your score."}</p>
                        <button onClick={openTestSelection} className="submit-btn" style={{maxWidth: '200px', margin: '1rem auto'}}>Take Another Test</button>
                    </div>
                ) : (
                    <div className="test-container">
                        <div className="question-card">
                            <div className="question-header">
                                <span>Question {testState.currentQuestion + 1} of {questions.length}</span>
                            </div>
                            <h3 className="question-text">{currentQ.question}</h3>
                            
                            <div className="options-grid">
                                {currentQ.options.map((option, index) => (
                                    <button 
                                        key={index}
                                        className={`option-btn ${testState.answers[currentQ.id] === index ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(currentQ.id, index)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="test-navigation">
                                <button 
                                    className="nav-btn" 
                                    disabled={testState.currentQuestion === 0}
                                    onClick={() => setTestState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }))}
                                >Previous</button>
                                
                                {testState.currentQuestion === questions.length - 1 ? (
                                    <button className="nav-btn submit-test-btn" onClick={submitTest}>Submit Test</button>
                                ) : (
                                    <button 
                                        className="nav-btn" 
                                        onClick={() => setTestState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))}
                                    >Next</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render Coding Test Module
    if (currentView === 'coding-test') {
        const currentQ = codingQuestions[testState.currentQuestion];

        return (
            <div className="portal-container" style={{maxWidth: '1200px'}}>
                <div className="portal-header">
                    <h2>Coding Assessment</h2>
                    {!testState.isSubmitted && (
                        <div className={`timer-display ${testState.timeLeft < 300 ? 'timer-warning' : ''}`}>
                            Time Left: {formatTime(testState.timeLeft)}
                        </div>
                    )}
                    {testState.isSubmitted && (
                        <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                    )}
                </div>

                {testState.isSubmitted ? (
                    <div className="result-card">
                        <h3>Assessment Submitted</h3>
                        <p>Your code has been submitted for evaluation.</p>
                        <button onClick={openTestSelection} className="submit-btn" style={{maxWidth: '200px', margin: '1rem auto'}}>Take Another Test</button>
                    </div>
                ) : (
                    <div className="coding-ide-container">
                        <div className="problem-pane">
                            <h3>{currentQ.title}</h3>
                            <p className="problem-desc">{currentQ.description}</p>
                            <div className="problem-example">
                                <strong>Example:</strong>
                                <pre>{currentQ.example}</pre>
                            </div>
                            <div className="test-navigation" style={{marginTop: 'auto'}}>
                                <button 
                                    className="nav-btn" 
                                    disabled={testState.currentQuestion === 0}
                                    onClick={() => setTestState(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1, code: codingQuestions[prev.currentQuestion - 1].starterCodes[ideLanguage], output: '' }))}
                                >Previous</button>
                                {testState.currentQuestion < codingQuestions.length - 1 && (
                                    <button 
                                        className="nav-btn" 
                                        onClick={() => setTestState(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1, code: codingQuestions[prev.currentQuestion + 1].starterCodes[ideLanguage], output: '' }))}
                                    >Next</button>
                                )}
                            </div>
                        </div>
                        <div className="editor-pane">
                            <div className="editor-header">
                                <span>Code Editor</span>
                                <div className="editor-controls">
                                    <select value={ideLanguage} onChange={handleLanguageChange} className="ide-select">
                                        <option value="javascript">JavaScript</option>
                                        <option value="python">Python</option>
                                        <option value="java">Java</option>
                                        <option value="cpp">C++</option>
                                    </select>
                                    <select value={ideTheme} onChange={handleThemeChange} className="ide-select">
                                        <option value="dark">Dark Theme</option>
                                        <option value="light">Light Theme</option>
                                    </select>
                                </div>
                            </div>
                            <textarea 
                                className={`code-editor ${ideTheme}`} 
                                value={testState.code} 
                                onChange={handleCodeChange}
                                spellCheck="false"
                            ></textarea>
                            <div className="console-pane">
                                <div className="console-header">Output Console</div>
                                <pre className="console-output">{testState.output || "Run your code to see output..."}</pre>
                            </div>
                            <div className="editor-actions">
                                <button className="action-btn run-btn" onClick={runCode}>Run Code</button>
                                <button className="action-btn submit-test-btn" onClick={submitTest}>Submit Assessment</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Render ATS Tracker
    if (currentView === 'ats-tracker') {
        return (
            <div className="portal-container">
                <div className="portal-header">
                    <h2>ATS Resume Tracker</h2>
                    <button onClick={() => setCurrentView('dashboard')} className="action-btn">Back to Dashboard</button>
                </div>
                <div className="ats-container">
                    <div className="ats-upload-card">
                        <h3>Check Your Resume Score</h3>
                        <p style={{color: '#718096', marginBottom: '1.5rem'}}>Upload your resume (PDF) to get an instant ATS compatibility score.</p>
                        
                        <div className="file-upload-wrapper" style={{maxWidth: '400px', margin: '0 auto'}}>
                            <input type="file" accept=".pdf" onChange={handleAtsFileChange} className="file-input" />
                        </div>

                        <button className="submit-btn" onClick={analyzeResume} disabled={isAnalyzing} style={{maxWidth: '200px', marginTop: '1.5rem'}}>
                            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
                        </button>
                    </div>

                    {atsResult && (
                        <div className="ats-result-card">
                            <div className="score-circle" style={{background: `conic-gradient(${atsResult.score >= 80 ? '#48bb78' : '#ecc94b'} 0% ${atsResult.score}%, #edf2f7 ${atsResult.score}% 100%)`}}>
                                <span>{atsResult.score}%</span>
                                <small>ATS Score</small>
                            </div>
                            <div className="ats-feedback">
                                <h4>Analysis Report</h4>
                                <p style={{color: '#4a5568', marginBottom: '1rem'}}>
                                    {atsResult.score >= 80 
                                        ? "Excellent! Your resume is well-optimized for ATS systems." 
                                        : "Good start, but consider adding more industry-specific keywords and quantifying your achievements."}
                                </p>
                                <div className="tags">
                                    <span className="tag success">Format: PDF</span>
                                    <span className={`tag ${atsResult.score >= 80 ? 'success' : 'error'}`}>Readability: {atsResult.score >= 80 ? 'High' : 'Medium'}</span>
                                    <span className="tag success">Keywords Found: 12</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Render Dashboard
    return (
        <div className="portal-container">
            <div className="portal-header">
                <h2>{portalName}</h2>
                <div className="header-actions">
                    <div className="notification-wrapper">
                        <button className="notification-btn" onClick={() => setShowNotifications(prev => !prev)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                        </button>
                        {showNotifications && (
                            <div className="notification-panel">
                                <div className="notification-panel-header">
                                    <h3>Notifications</h3>
                                    {unreadCount > 0 && <button className="mark-read-btn" onClick={markAllAsRead}>Mark all as read</button>}
                                </div>
                                <div className="notification-list">
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                                            <p>{n.message}</p>
                                            <small>{formatTimestamp(n.timestamp)}</small>
                                        </div>
                                    )) : <p className="no-data" style={{padding: '1rem'}}>No notifications yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                    <button onClick={openTestSelection} className="profile-btn btn-test">Online Test</button>
                    <button onClick={() => setCurrentView('ats-tracker')} className="profile-btn btn-ats">ATS Tracker</button>
                    <button onClick={() => setCurrentView('applications')} className="profile-btn btn-apps">My Applications</button>
                    <button onClick={() => setCurrentView('profile')} className="profile-btn">Manage Profile</button>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </div>
            
            <div className="dashboard-content">
                <p>Welcome, {formData.fullName || formData.email}!</p>
                
                <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#2d3748'}}>Available Opportunities</h3>
                
                <div className="job-list">
                    {availableJobs.map(job => {
                        const { isEligible, reasons } = checkEligibility(job);
                        const isApplied = applications.some(app => app.jobId === job.id);
                        
                        return (
                            <div key={job.id} className="job-card">
                                <div className="job-header">
                                    <div>
                                        <div className="job-company">{job.company}</div>
                                        <div className="job-role">{job.title}</div>
                                    </div>
                                    <span className={`eligibility-status ${isEligible ? 'eligible' : 'not-eligible'}`}>
                                        {isEligible ? 'Eligible' : 'Not Eligible'}
                                    </span>
                                </div>
                                {job.salary && (
                                    <div style={{marginBottom: '0.5rem', fontSize: '0.9rem', color: '#2d3748'}}>
                                        <strong>Package:</strong> {job.salary} | <strong>Exp:</strong> {job.experience}
                                    </div>
                                )}
                                {job.rounds && job.rounds.length > 0 && (
                                    <div style={{marginBottom: '0.5rem', fontSize: '0.85rem', color: '#718096'}}><strong>Rounds:</strong> {job.rounds.join(' → ')}</div>
                                )}
                                <p style={{color: '#4a5568', fontSize: '0.95rem', marginBottom: '1rem'}}>{job.description}</p>
                                
                                <div className="criteria-list">
                                    <small><strong>Criteria:</strong> {job.criteria.minCgpa}+ CGPA | {job.criteria.maxBacklogs} Backlogs | {job.criteria.passOutYear.join('/')} Batch</small>
                                </div>

                                {!isEligible && (
                                    <div className="ineligibility-reasons">
                                        <strong>Why you can't apply:</strong>
                                        <ul>
                                            {reasons.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button className="apply-btn" disabled={!isEligible || isApplied} onClick={() => applyForJob(job.id)}>
                                    {isApplied ? 'Applied' : (isEligible ? 'Apply Now' : 'Not Eligible')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StudentPortal;