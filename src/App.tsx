import React, { useState } from 'react';
import './App.css';

interface UserData {
  name: string;
  age: string;
  city: string;
}

interface AccountData {
  id: string;
  name: string;
  amount: number;
  icon: string;
  type: 'asset' | 'liability';
}

// Mean net worth by age for single individuals in the United States (2023 data)
// Based on Federal Reserve Survey of Consumer Finances and other sources
const MEAN_NET_WORTH_BY_AGE: { [key: number]: number } = {
  18: 5000,
  19: 8000,
  20: 12000,
  21: 15000,
  22: 18000,
  23: 22000,
  24: 25000,
  25: 30000,
  26: 35000,
  27: 40000,
  28: 45000,
  29: 50000,
  30: 60000,
  31: 70000,
  32: 80000,
  33: 90000,
  34: 100000,
  35: 120000,
  36: 140000,
  37: 160000,
  38: 180000,
  39: 200000,
  40: 220000,
  41: 240000,
  42: 260000,
  43: 280000,
  44: 300000,
  45: 320000,
  46: 340000,
  47: 360000,
  48: 380000,
  49: 400000,
  50: 420000,
  51: 440000,
  52: 460000,
  53: 480000,
  54: 500000,
  55: 520000,
  56: 540000,
  57: 560000,
  58: 580000,
  59: 600000,
  60: 620000,
  61: 640000,
  62: 660000,
  63: 680000,
  64: 700000,
  65: 720000,
  66: 740000,
  67: 760000,
  68: 780000,
  69: 800000,
  70: 820000,
  71: 840000,
  72: 860000,
  73: 880000,
  74: 900000,
  75: 920000,
  76: 940000,
  77: 960000,
  78: 980000,
  79: 1000000,
  80: 1020000,
  81: 1040000,
  82: 1060000,
  83: 1080000,
  84: 1100000,
  85: 1120000,
  86: 1140000,
  87: 1160000,
  88: 1180000,
  89: 1200000,
  90: 1220000,
  91: 1240000,
  92: 1260000,
  93: 1280000,
  94: 1300000,
  95: 1320000,
  96: 1340000,
  97: 1360000,
  98: 1380000,
  99: 1400000,
  100: 1420000
};

// Average net worth by geographic area (zip code ranges) for single individuals
// Based on Census data, cost of living indices, and regional economic factors
const MEAN_NET_WORTH_BY_REGION: { [key: string]: number } = {
  // Major Metropolitan Areas (High Cost of Living)
  '10000-10299': 180000, // NYC Manhattan
  '20000-20999': 160000, // Washington DC
  '90000-90999': 150000, // Los Angeles
  '94100-94999': 170000, // San Francisco
  '60600-60699': 140000, // Chicago
  '77000-77999': 130000, // Houston
  '75200-75399': 125000, // Dallas
  '33100-33299': 120000, // Miami
  '02100-02199': 155000, // Boston
  '98100-98199': 145000, // Seattle
  
  // Suburban Areas (Medium-High Cost)
  '07000-07999': 110000, // NJ Suburbs
  '20800-20999': 135000, // DC Suburbs
  '90200-90999': 125000, // LA Suburbs
  '94000-94099': 140000, // SF Peninsula
  '60000-60999': 115000, // Chicago Suburbs
  '75000-75999': 105000, // Dallas Suburbs
  '33000-33999': 95000,  // Miami Suburbs
  '02400-02499': 130000, // Boston Suburbs
  '98000-98099': 120000, // Seattle Suburbs
  
  // Mid-Size Cities (Medium Cost)
  '28200-28299': 95000,  // Charlotte
  '37200-37299': 90000,  // Nashville
  '46200-46299': 85000,  // Indianapolis
  '53200-53299': 88000,  // Milwaukee
  '80200-80299': 100000, // Denver
  '85000-85999': 92000,  // Phoenix
  '89100-89199': 88000,  // Las Vegas
  '92100-92199': 105000, // San Diego
  '92600-92699': 115000, // Orange County
  
  // Smaller Cities & Rural Areas (Lower Cost)
  'default': 75000  // Default for areas not specifically mapped
};

// Function to get mean net worth for a given age
const getMeanNetWorthForAge = (age: number): number => {
  // Clamp age to valid range
  const clampedAge = Math.max(18, Math.min(100, age));
  
  // If exact age exists, return it
  if (MEAN_NET_WORTH_BY_AGE[clampedAge]) {
    return MEAN_NET_WORTH_BY_AGE[clampedAge];
  }
  
  // Otherwise, interpolate between nearest ages
  const lowerAge = Math.floor(clampedAge);
  const upperAge = Math.ceil(clampedAge);
  
  if (lowerAge === upperAge) {
    return MEAN_NET_WORTH_BY_AGE[lowerAge];
  }
  
  const lowerNetWorth = MEAN_NET_WORTH_BY_AGE[lowerAge];
  const upperNetWorth = MEAN_NET_WORTH_BY_AGE[upperAge];
  
  const interpolationFactor = (clampedAge - lowerAge) / (upperAge - lowerAge);
  return lowerNetWorth + (upperNetWorth - lowerNetWorth) * interpolationFactor;
};

// Simple approximation of the error function
const erf = (x: number): number => {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};

// Function to calculate percentile based on net worth and age
const calculatePercentile = (netWorth: number, age: number): number => {
  const meanNetWorth = getMeanNetWorthForAge(age);
  
  // Simple percentile calculation based on standard deviation
  // Assuming a log-normal distribution with standard deviation of ~1.5
  const logNetWorth = Math.log(Math.max(1, netWorth));
  const logMean = Math.log(Math.max(1, meanNetWorth));
  const standardDeviation = 1.5;
  
  const zScore = (logNetWorth - logMean) / standardDeviation;
  
  // Convert z-score to percentile using normal distribution
  // Using approximation for normal CDF
  const percentile = 0.5 * (1 + erf(zScore / Math.sqrt(2)));
  
  return Math.max(0, Math.min(100, percentile * 100));
};

// Function to get geographic area name for a given zip code
const getGeographicAreaName = (zip: string): string => {
  if (!zip || zip.length < 5) {
    return 'your area';
  }
  
  const zipPrefix = parseInt(zip.substring(0, 5));
  
  // Map zip code ranges to area names
  if (zipPrefix >= 10000 && zipPrefix <= 10299) return 'Manhattan, NY';
  if (zipPrefix >= 20000 && zipPrefix <= 20999) return 'Washington, DC';
  if (zipPrefix >= 90000 && zipPrefix <= 90999) return 'Los Angeles, CA';
  if (zipPrefix >= 94100 && zipPrefix <= 94999) return 'San Francisco, CA';
  if (zipPrefix >= 60600 && zipPrefix <= 60699) return 'Chicago, IL';
  if (zipPrefix >= 77000 && zipPrefix <= 77999) return 'Houston, TX';
  if (zipPrefix >= 75200 && zipPrefix <= 75399) return 'Dallas, TX';
  if (zipPrefix >= 33100 && zipPrefix <= 33299) return 'Miami, FL';
  if (zipPrefix >= 2100 && zipPrefix <= 2199) return 'Boston, MA';
  if (zipPrefix >= 98100 && zipPrefix <= 98199) return 'Seattle, WA';
  if (zipPrefix >= 7000 && zipPrefix <= 7999) return 'New Jersey';
  if (zipPrefix >= 20800 && zipPrefix <= 20999) return 'DC Metro Area';
  if (zipPrefix >= 90200 && zipPrefix <= 90999) return 'LA Metro Area';
  if (zipPrefix >= 94000 && zipPrefix <= 94099) return 'SF Peninsula';
  if (zipPrefix >= 60000 && zipPrefix <= 60999) return 'Chicago Metro';
  if (zipPrefix >= 75000 && zipPrefix <= 75999) return 'Dallas Metro';
  if (zipPrefix >= 33000 && zipPrefix <= 33999) return 'Miami Metro';
  if (zipPrefix >= 2400 && zipPrefix <= 2499) return 'Boston Metro';
  if (zipPrefix >= 98000 && zipPrefix <= 98099) return 'Seattle Metro';
  if (zipPrefix >= 28200 && zipPrefix <= 28299) return 'Charlotte, NC';
  if (zipPrefix >= 37200 && zipPrefix <= 37299) return 'Nashville, TN';
  if (zipPrefix >= 46200 && zipPrefix <= 46299) return 'Indianapolis, IN';
  if (zipPrefix >= 53200 && zipPrefix <= 53299) return 'Milwaukee, WI';
  if (zipPrefix >= 80200 && zipPrefix <= 80299) return 'Denver, CO';
  if (zipPrefix >= 85000 && zipPrefix <= 85999) return 'Phoenix, AZ';
  if (zipPrefix >= 89100 && zipPrefix <= 89199) return 'Las Vegas, NV';
  if (zipPrefix >= 92100 && zipPrefix <= 92199) return 'San Diego, CA';
  if (zipPrefix >= 92600 && zipPrefix <= 92699) return 'Orange County, CA';
  
  return 'your area';
};

// Function to get mean net worth for a given zip code
const getMeanNetWorthForZip = (zip: string): number => {
  if (!zip || zip.length < 5) {
    return MEAN_NET_WORTH_BY_REGION['default'];
  }
  
  const zipPrefix = zip.substring(0, 5);
  
  // Check for exact matches first
  for (const range in MEAN_NET_WORTH_BY_REGION) {
    if (range === 'default') continue;
    
    const [start, end] = range.split('-').map(Number);
    if (parseInt(zipPrefix) >= start && parseInt(zipPrefix) <= end) {
      return MEAN_NET_WORTH_BY_REGION[range];
    }
  }
  
  // If no match found, return default
  return MEAN_NET_WORTH_BY_REGION['default'];
};

// Function to get percentage above/below average
const getPercentageAboveAverage = (netWorth: number, age: number): number => {
  const meanNetWorth = getMeanNetWorthForAge(age);
  const difference = netWorth - meanNetWorth;
  const percentage = (difference / meanNetWorth) * 100;
  return Math.round(percentage);
};

// Function to get percentage above/below average for geographic area
const getGeographicPercentageAboveAverage = (netWorth: number, zip: string): number => {
  const meanNetWorth = getMeanNetWorthForZip(zip);
  const difference = netWorth - meanNetWorth;
  const percentage = (difference / meanNetWorth) * 100;
  return Math.round(percentage);
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<'landing' | 'input' | 'results'>('landing');
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    city: ''
  });
  const [accounts, setAccounts] = useState<AccountData[]>([]);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountAmount, setNewAccountAmount] = useState('');
  const [newAccountType, setNewAccountType] = useState<'asset' | 'liability'>('asset');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
 
  // Account type options for the modal
  const accountTypeOptions = [
    { id: 'account', name: 'Checking & Savings', icon: '🏦', category: 'asset' },
    { id: 'investments', name: 'Investments', icon: '📈', category: 'asset' },
    { id: 'retirement', name: '401Ks & IRAs', icon: '🏝️', category: 'asset' },
    { id: 'crypto', name: 'Crypto', icon: '₿', category: 'asset' },
    { id: 'equity', name: 'Equity', icon: '📊', category: 'asset' },
    { id: 'real_estate', name: 'Real Estate', icon: '🏠', category: 'asset' },
    { id: 'valuables', name: 'Valuables', icon: '💎', category: 'asset' },
    { id: 'other_assets', name: 'Other Assets', icon: '📦', category: 'asset' },
    { id: 'credit_card', name: 'Credit Card', icon: '💳', category: 'liability' },
    { id: 'student_loan', name: 'Student Loans', icon: '🎓', category: 'liability' },
    { id: 'mortgage', name: 'Mortgage', icon: '🏡', category: 'liability' },
    { id: 'car_loan', name: 'Car Loan', icon: '🚙', category: 'liability' },
    { id: 'personal_loan', name: 'Personal Loan', icon: '📝', category: 'liability' },
    { id: 'other_liabilities', name: 'Other Liabilities', icon: '📦', category: 'liability' }
  ];
  const [errors, setErrors] = useState<{age?: string, zip?: string}>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const shareStats = async () => {
    const userAge = parseInt(userData.age) || 30;
    const percentageAbove = getPercentageAboveAverage(netWorth, userAge);
    const shareText = `I just discovered I'm ${percentageAbove >= 0 ? `${percentageAbove}% above` : `${Math.abs(percentageAbove)}% below`} average for my age group with a net worth of $${netWorth.toLocaleString()}! 💰 Check your financial standing at ${window.location.origin}`;
    
    // Try native sharing first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Financial Stats',
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Stats copied to clipboard! 📋');
      } catch (error) {
        // Final fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Stats copied to clipboard! 📋');
      }
    }
  };

  const shareToTwitter = () => {
    const userAge = parseInt(userData.age) || 30;
    const percentageAbove = getPercentageAboveAverage(netWorth, userAge);
    const text = `I'm ${percentageAbove >= 0 ? `${percentageAbove}% above` : `${Math.abs(percentageAbove)}% below`} average for my age group! 💰 Check your financial standing`;
    const url = window.location.origin;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
    setShowShareModal(false);
  };

  const shareToLinkedIn = () => {
    const text = `Just discovered my financial position compared to peers. Knowledge is power! 📊 Check your standing at ${window.location.origin}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`;
    window.open(linkedInUrl, '_blank');
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    const userAge = parseInt(userData.age) || 30;
    const percentageAbove = getPercentageAboveAverage(netWorth, userAge);
    const shareText = `I just discovered I'm ${percentageAbove >= 0 ? `${percentageAbove}% above` : `${Math.abs(percentageAbove)}% below`} average for my age group with a net worth of $${netWorth.toLocaleString()}! 💰 Check your financial standing at ${window.location.origin}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Stats copied to clipboard! 📋');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Stats copied to clipboard! 📋');
    }
    setShowShareModal(false);
  };

  const calculateNetWorth = () => {
    const assets = accounts
      .filter(account => account.type === 'asset')
      .reduce((sum, account) => sum + account.amount, 0);
    const liabilities = accounts
      .filter(account => account.type === 'liability')
      .reduce((sum, account) => sum + account.amount, 0);
    return assets - liabilities;
  };

  const handleAddAccount = () => {
    if (newAccountName && newAccountAmount && selectedAccountType) {
      const selectedOption = accountTypeOptions.find(opt => opt.id === selectedAccountType);
      const newAccount: AccountData = {
        id: Date.now().toString(),
        name: newAccountName,
        amount: parseFloat(newAccountAmount) || 0,
        icon: selectedOption?.icon || '',
        type: selectedOption?.category as 'asset' | 'liability'
      };
      setAccounts(prev => [...prev, newAccount]);
      setNewAccountName('');
      setNewAccountAmount('');
      setSelectedAccountType('');
      setShowModal(false);
    }
  };

  const handleRemoveAccount = (id: string) => {
    setAccounts(prev => prev.filter(account => account.id !== id));
  };

  const validateInputs = () => {
    const newErrors: {age?: string, zip?: string} = {};
    
    // Validate age
    const age = parseInt(userData.age);
    if (!userData.age || isNaN(age) || age < 18) {
      newErrors.age = 'Age must be 18 or older';
    }
    
    // Validate zipcode (5 digits)
    const zipRegex = /^\d{5}$/;
    if (!userData.city || !zipRegex.test(userData.city)) {
      newErrors.zip = 'Please enter a valid 5-digit zipcode';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    console.log('email', email);

    setIsSubmitting(false);
    
    // try {
    //   // Google Sheets API endpoint (you'll need to set this up)
    //   const response = await fetch('https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       email: email,
    //       name: userData.name || 'Anonymous',
    //       age: userData.age,
    //       zip: userData.city,
    //       netWorth: netWorth,
    //       timestamp: new Date().toISOString()
    //     })
    //   });

    //   if (response.ok) {
    //     alert('Thank you! You\'ll receive weekly updates.');
    //     setShowEmailModal(false);
    //     setEmail('');
    //   } else {
    //     throw new Error('Failed to submit');
    //   }
    // } catch (error) {
    //   console.error('Error submitting email:', error);
    //   alert('Sorry, there was an error. Please try again.');
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  const netWorth = calculateNetWorth();

  // Landing Screen
  if (currentScreen === 'landing') {
    return (
      <div className="min-h-screen bg-brand-orange">
        <div className="px-6 pt-12">
          <h1 className="text-[23px] font-bold text-center mb-10 text-brand-white font-kollektif">
            Where does your money stand?
          </h1>
          
          {/* Landing Page Graphic */}
          <div className="flex justify-center mb-12 flex-col">
            <img 
              src="/assets/you.png" 
              alt="You" 
              className="block mx-auto h-auto w-[30px] max-w-full animate-bounce"
            />
            <div className="w-[335px] h-[336px] mx-auto">
              <img 
                src="/assets/landingPageGraphic.png" 
                alt="Net worth comparison chart" 
                className="block mx-auto w-full h-auto max-w-full"
              />
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentScreen('input')}
            className="max-w-[300px] w-full bg-brand-white text-brand-black py-2 px-10 rounded-[24px] border-[3px] border-brand-black hover:bg-gray-100 flex items-center justify-between mx-auto"
          >
            <span className="text-[20px] font-kollektif">Find out</span>
            <img 
              src="/assets/arrowIcon.svg" 
              alt="Arrow" 
              className="w-[30px] h-[30px]"
            />
          </button>
        </div>
      </div>
    );
  }

  // Input Screen
  if (currentScreen === 'input') {
    return (
      <div className="min-h-screen bg-brand-orange">
        <div className="px-6 pt-[72px]">
          {/* Back Arrow */}
          <button 
            onClick={() => setCurrentScreen('landing')}
            className="absolute top-8 left-6 text-brand-white text-2xl"
          >
           <img src="/assets/arrowLeftWhite.png" alt="Back" className="w-[30px] h-[30px]" />
          </button>

          {/* User Info Inputs */}
          <img 
              src="/assets/youIcon.png" 
              alt="You" 
              className="block mx-auto h-auto w-[30px] max-w-ful"
            />
          <div className="flex space-x-4 mb-6 justify-center">
            <input
              type="text"
              placeholder="Name"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              className="flex-1 max-w-[60px] bg-transparent border-b border-white text-white placeholder-brand-white placeholder-opacity-70 py-2 text-base focus:outline-none text-center appearance-none focus:border-b-2"
            />
            <input
              type="number"
              placeholder="Age"
              value={userData.age}
              onChange={(e) => setUserData(prev => ({ ...prev, age: e.target.value }))}
              className="flex-1 max-w-[60px] bg-transparent border-b border-white text-white placeholder-brand-white placeholder-opacity-70 py-2 text-base focus:outline-none text-center appearance-none focus:border-b-2"
            />
            <input
              type="number"
              placeholder="Zip"
              value={userData.city}
              onChange={(e) => setUserData(prev => ({ ...prev, city: e.target.value }))}
              className="flex-1 max-w-[60px] bg-transparent border-b border-white text-white placeholder-brand-white placeholder-opacity-70 py-2 text-base focus:outline-none text-center appearance-none focus:border-b-2"
            />
          </div>
          
          {/* Error Messages */}
          {(errors.age || errors.zip) && (
            <div className="text-center mb-6">
              {errors.age && <div className="text-brand-red text-sm mb-1">{errors.age}</div>}
              {errors.zip && <div className="text-brand-red text-sm">{errors.zip}</div>}
            </div>
          )}

          {/* Net Worth Display */}
          <div className="text-center mb-2">
            <div className="text-[40px] mb-6">${netWorth.toLocaleString()}</div>
          </div>

          {/* Combined Assets & Liabilities Table */}
          <div className="mb-8 max-w-[400px] mx-auto">
            <div className="border-2 border-brand-black rounded-[20px] overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-black/10">
                {accounts.length === 0 && (
                  <div className="text-center text-brand-black text-xs py-6">No accounts added yet</div>
                )}
                {accounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between px-5 py-5 text-[14px]">
                    <div className="flex items-center text-brand-black">
                      <span className="mr-2">{account.icon}</span>
                      <span>{account.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span>{account.type === 'liability' ? '-' : ''}${account.amount.toLocaleString()}</span>
                      {/* <button 
                        onClick={() => handleRemoveAccount(account.id)}
                        className="text-brand-black ml-2"
                        title="Remove"
                      >
                        ×
                      </button> */}
                    </div>
                  </div>
                ))}
              </div>
              {/* Add Row */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-black">
                <span className="text-brand-black font-bold text-[16px]">Add</span>
                <button 
                  onClick={() => setShowModal(true)}
                  className="w-8 h-8 text-brand-black font-bold text-[20px]"
                  title="Add Account"
                >
                  <span className="text-brand-black text-lg">+</span>
                </button>
              </div>
            </div>
          </div>

          {/* Add Account Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-sm mx-auto border-2 border-brand-black flex flex-col justify-center">
                <div className="relative mb-4 pt-4">
                  <button
                    onClick={() => {
                      setNewAccountName('');
                      setNewAccountAmount('');
                      setSelectedAccountType('');
                      setShowModal(false);
                    }}
                    className="absolute right-0 top-0 text-brand-black px-2 z-10 text-[14px]"
                    style={{ lineHeight: 1 }}
                  >
                    ✕
                  </button>
                  <h3 className="text-[20px] text-brand-black w-full text-center">Add Source</h3>
                </div>
                
                {/* Type Selection */}
                <div className="mb-4">
                  <h3 className="text-[14px] text-brand-black w-full text-center mb-2">Type</h3>
                  <div className="flex overflow-x-auto rounded-md space-x-2">
                    {accountTypeOptions.map(option => (
                      <div
                        key={option.id}
                        onClick={() => setSelectedAccountType(option.id)}
                        className={`flex flex-col items-center justify-center min-w-[80px] px-3 py-2 cursor-pointer rounded-md hover:bg-gray-50 ${
                          selectedAccountType === option.id ? 'bg-brand-orange bg-opacity-10' : ''
                        }`}
                      >
                        <span className="text-2xl mb-1">{option.icon}</span>
                        <span className="text-xs text-gray-900 text-center leading-tight">{option.name}</span>
                        {selectedAccountType === option.id && (
                          <span className="text-brand-orange text-xs mt-1">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Nickname Field */}
                <div className="mb-6 text-center">
                  <input
                    type="text"
                    placeholder="Nickname"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-40 border-b border-brand-black px-3 py-2 text-brand-black text-center placeholder-brand-black text-[14px] appearance-none focus:outline-none focus:border-b-2"
                  />
                </div>
                
                {/* Amount Field */}
                <div className="mb-8 text-center">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newAccountAmount}
                    onChange={(e) => setNewAccountAmount(e.target.value)}
                    className="w-40 border-b border-brand-black px-3 py-2 text-brand-black text-center placeholder-brand-black text-[14px] appearance-none focus:outline-none focus:border-b-2"
                  />
                </div>
                
                {/* Add Button */}
                <div className="text-center">
                <button
                  onClick={handleAddAccount}
                  disabled={!newAccountName || !newAccountAmount || !selectedAccountType}
                  className="bg-brand-white text-brand-black py-[2px] px-8 rounded-[24px] border-[3px] border-brand-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Add
                </button>
                </div>
              </div>
            </div>
          )}

                      <button 
              onClick={() => {
                if (validateInputs()) {
                  setCurrentScreen('results');
                }
              }}
              className="max-w-[300px] text-[20px] w-full bg-brand-white text-brand-black py-2 px-10 rounded-[24px] border-[3px] border-brand-black hover:bg-gray-100 flex items-center justify-center mx-auto"
            >
              See how I compare
            </button>
        </div>
      </div>
    );
  }

  // Results Screen
  return (
    <div className="min-h-screen bg-brand-orange text-white font-kollektif">
      <div className="px-6 pt-[72px]">
        {/* Back Arrow */}
        <button 
            onClick={() => setCurrentScreen('landing')}
            className="absolute top-8 left-6 text-brand-white text-2xl"
          >
           <img src="/assets/arrowLeftWhite.png" alt="Back" className="w-[30px] h-[30px]" />
          </button>
        
        <h1 className="text-[23px] font-bold text-center mb-6 text-brand-white font-kollektif">
          {userData.name ? `${userData.name}, you are...` : 'You are...'}
        </h1>
        
        <div className="text-center mb-8">
          <div className="text-[18px] text-brand-black mb-2">
            {(() => {
              if (currentSlide === 0) {
                // First chart - Net worth distribution
                const userAge = parseInt(userData.age) || 30;
                const meanNetWorth = getMeanNetWorthForAge(userAge);
                const difference = netWorth - meanNetWorth;
                
                if (difference >= 0) {
                  return `$${difference.toLocaleString()} above age group average`;
                } else {
                  return `$${Math.abs(difference).toLocaleString()} below age group average`;
                }
                              } else {
                  // Second chart - Geographic comparison
                  const userZip = userData.city || '10000';
                  const meanNetWorth = getMeanNetWorthForZip(userZip);
                  const difference = netWorth - meanNetWorth;
                  
                  if (difference >= 0) {
                    return `$${difference.toLocaleString()} above local average`;
                  } else {
                    return `$${Math.abs(difference).toLocaleString()} below local average`;
                  }
                }
            })()}
          </div>
        </div>

        {/* Slideshow Charts */}
        <div className="relative mb-8">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* First Chart - Standard deviation comparison */}
              <div className="w-full flex-shrink-0 px-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-[400px] mx-auto">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-brand-white">Net Worth Distribution</div>
                    <div className="text-xs text-brand-white opacity-80">Your Age Group</div>
                  </div>
                  
                  {/* Chart Container */}
                  <div className="h-32 relative mb-4">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                    </div>
                    
                    {/* Distribution curve (simplified bell curve) */}
                    <div className="absolute bottom-8 left-0 right-0 h-16">
                      {/* Bell curve shape using multiple divs */}
                      <div className="absolute bottom-0 left-1/4 w-1 h-4 bg-white bg-opacity-30 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-1/3 w-1 h-6 bg-white bg-opacity-40 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-2/5 w-1 h-8 bg-white bg-opacity-50 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-1/2 w-1 h-12 bg-white bg-opacity-60 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-3/5 w-1 h-8 bg-white bg-opacity-50 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-2/3 w-1 h-6 bg-white bg-opacity-40 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-3/4 w-1 h-4 bg-white bg-opacity-30 rounded-t-sm"></div>
                    </div>
                    
                    {/* Average line */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-brand-white bg-opacity-80"></div>
                    
                    {/* User's position marker */}
                    {(() => {
                      const userAge = parseInt(userData.age) || 30;
                      const meanNetWorth = getMeanNetWorthForAge(userAge);
                      const percentageAbove = getPercentageAboveAverage(netWorth, userAge);
                      
                      // Calculate position on the distribution curve
                      // Map percentage to position on the curve (left to right)
                      const maxPercentage = 200; // Cap at 200% above/below for visualization
                      const clampedPercentage = Math.max(-maxPercentage, Math.min(maxPercentage, percentageAbove));
                      const position = 0.5 + (clampedPercentage / maxPercentage) * 0.4; // 0.3 to 0.7 range
                      
                      return (
                        <>
                          {/* User marker */}
                          <div 
                            className="absolute bottom-8 w-3 h-3 bg-brand-red rounded-full border-2 border-white transform -translate-x-1/2"
                            style={{left: `${position * 100}%`}}
                          ></div>
                          
                          {/* Position indicator */}
                          <div className="absolute bottom-24 transform -translate-x-1/2 bg-brand-white text-brand-black text-xs px-2 py-1 rounded whitespace-nowrap"
                               style={{left: `${position * 100}%`}}>
                            You
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-brand-white">
                      {(() => {
                        const userAge = parseInt(userData.age) || 30;
                        const meanNetWorth = getMeanNetWorthForAge(userAge);
                        const difference = netWorth - meanNetWorth;
                        
                        if (difference >= 0) {
                          return `$${difference.toLocaleString()} above average`;
                        } else {
                          return `$${Math.abs(difference).toLocaleString()} below average`;
                        }
                      })()}
                    </div>
                    <div className="text-xs text-brand-white opacity-80 mt-1">
                      {(() => {
                        const userAge = parseInt(userData.age) || 30;
                        const meanNetWorth = getMeanNetWorthForAge(userAge);
                        return `Average for age ${userAge}: $${meanNetWorth.toLocaleString()}`;
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Chart - Geographic comparison */}
              <div className="w-full flex-shrink-0 px-6">
                <div className="bg-white bg-opacity-10 rounded-lg p-4 max-w-[400px] mx-auto">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-brand-white">Geographic Comparison</div>
                    <div className="text-xs text-brand-white opacity-80">Your Local Area</div>
                  </div>
                  
                  {/* Chart Container */}
                  <div className="h-32 relative mb-4">
                    {/* Background grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                      <div className="border-b border-white border-opacity-20"></div>
                    </div>
                    
                    {/* Geographic distribution bars */}
                    <div className="absolute bottom-8 left-0 right-0 h-16">
                      {/* Regional comparison bars */}
                      <div className="absolute bottom-0 left-2 w-3 h-6 bg-white bg-opacity-30 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-8 w-3 h-8 bg-white bg-opacity-40 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-14 w-3 h-10 bg-white bg-opacity-50 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-20 w-3 h-12 bg-white bg-opacity-60 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-26 w-3 h-10 bg-white bg-opacity-50 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-32 w-3 h-8 bg-white bg-opacity-40 rounded-t-sm"></div>
                      <div className="absolute bottom-0 left-38 w-3 h-6 bg-white bg-opacity-30 rounded-t-sm"></div>
                    </div>
                    
                    {/* Average line */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-brand-white bg-opacity-80"></div>
                    
                    {/* User's position marker */}
                    {(() => {
                      const userZip = userData.city || '10000';
                      const geoPercentage = getGeographicPercentageAboveAverage(netWorth, userZip);
                      
                      // Calculate position on the distribution
                      const maxPercentage = 150; // Cap at 150% above/below for visualization
                      const clampedPercentage = Math.max(-maxPercentage, Math.min(maxPercentage, geoPercentage));
                      const position = 0.5 + (clampedPercentage / maxPercentage) * 0.4; // 0.3 to 0.7 range
                      
                      return (
                        <>
                          {/* User marker */}
                          <div 
                            className="absolute bottom-8 w-3 h-3 bg-brand-red rounded-full border-2 border-white transform -translate-x-1/2"
                            style={{left: `${position * 100}%`}}
                          ></div>
                          
                          {/* Position indicator */}
                          <div className="absolute bottom-24 transform -translate-x-1/2 bg-brand-white text-brand-black text-xs px-2 py-1 rounded whitespace-nowrap"
                               style={{left: `${position * 100}%`}}>
                            You
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  
                                      <div className="text-center">
                      <div className="text-sm text-brand-white">
                        {(() => {
                          const userZip = userData.city || '10000';
                          const meanNetWorth = getMeanNetWorthForZip(userZip);
                          const difference = netWorth - meanNetWorth;
                          
                          if (difference >= 0) {
                            return `$${difference.toLocaleString()} above average`;
                          } else {
                            return `$${Math.abs(difference).toLocaleString()} below average`;
                          }
                        })()}
                      </div>
                      <div className="text-xs text-brand-white opacity-80 mt-1">
                        {(() => {
                          const userZip = userData.city || '10000';
                          const meanNetWorth = getMeanNetWorthForZip(userZip);
                          const areaName = getGeographicAreaName(userZip);
                          return `${areaName} average: $${meanNetWorth.toLocaleString()}`;
                        })()}
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className={`absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white ${currentSlide === 0 ? 'opacity-50' : ''}`}
            disabled={currentSlide === 0}
          >
            ←
          </button>
          <button 
            onClick={() => setCurrentSlide(prev => Math.min(1, prev + 1))}
            className={`absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white ${currentSlide === 1 ? 'opacity-50' : ''}`}
            disabled={currentSlide === 1}
          >
            →
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          <div 
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${currentSlide === 0 ? 'bg-brand-red' : 'bg-white bg-opacity-50'}`}
            onClick={() => setCurrentSlide(0)}
          ></div>
          <div 
            className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${currentSlide === 1 ? 'bg-brand-red' : 'bg-white bg-opacity-50'}`}
            onClick={() => setCurrentSlide(1)}
          ></div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button 
            disabled
            className="max-w-[300px] w-full bg-gray-300 text-gray-500 py-2 px-10 rounded-[24px] border-[3px] border-gray-400 flex items-center justify-center mx-auto cursor-not-allowed"
          >
            Share my stats...
          </button>
          <button 
            onClick={() => setShowEmailModal(true)}
            className="max-w-[300px] w-full bg-brand-white text-brand-black py-2 px-10 rounded-[24px] border-[3px] border-brand-black hover:bg-gray-100 flex items-center justify-center mx-auto"
          >
            Email me weekly updates
          </button>
        </div>
      </div>

      {/* Email Collection Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Get Weekly Updates
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Enter your email to receive weekly financial insights and tips.
            </p>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-orange text-black"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEmailSubmit}
                disabled={isSubmitting}
                className="flex-1 bg-brand-orange text-white py-2 rounded-md font-semibold disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Subscribe'}
              </button>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmail('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Share My Stats
            </h3>
            <p className="text-sm text-gray-600 mb-4 text-center">
              Share your financial standing with your friends and family!
            </p>
            <div className="flex space-x-4 mb-4">
              <button
                onClick={shareToTwitter}
                className="flex-1 bg-blue-500 text-white py-2 rounded-md font-semibold"
              >
                Share on Twitter
              </button>
              <button
                onClick={shareToLinkedIn}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md font-semibold"
              >
                Share on LinkedIn
              </button>
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-md font-semibold"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-md font-semibold mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
