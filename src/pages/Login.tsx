import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Stethoscope, Mail, Lock, UserCircle2, ChevronRight, Github, Info, Check, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

import { saveToDatabase, fetchWithFallback } from '../services/api';

const testimonials = [
  {
    text: "MediCore has completely transformed how we manage patient workflows.",
    author: "— Dr. Sarah Chen, Chief Medical Officer"
  },
  {
    text: "Our hospital efficiency increased by 40% after using MediCore.",
    author: "— Dr. Ahmed Rahman"
  },
  {
    text: "A powerful and simple system for managing doctors and patients.",
    author: "— Dr. Emily Watson"
  }
];

export const Login = () => {
  const { setAuth, setLoading, isLoading } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [mobileNo, setMobileNo] = React.useState('');
  const [bloodGroup, setBloodGroup] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [fatherName, setFatherName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [role, setRole] = React.useState<UserRole | ''>('');
  const [tenantId] = React.useState('MediCore Central');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [testimonialIndex, setTestimonialIndex] = React.useState(0);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSignUp) {
        if (email && password) {
          // In a real app, this would be a real auth check
          // For this demo, we'll fetch the profile
          const profiles = await fetchWithFallback('profiles', []);
          const profile = profiles.find((p: any) => p.email === email);
          
          if (profile) {
            setAuth({
              uid: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as UserRole,
              tenantId: profile.tenantId,
              createdAt: profile.createdAt,
              emailVerified: true,
              mobileNo: profile.mobileNo,
              bloodGroup: profile.bloodGroup,
              address: profile.address,
              fatherName: profile.fatherName,
              age: profile.age
            });
            // Persist for session
            localStorage.setItem('medicore_user', JSON.stringify(profile));
          } else {
            setError("User not found. Please register first.");
          }
        } else {
          setError("Please enter both email and password.");
        }
      } else {
        if (!role || !fullName || !mobileNo) {
          setError("Please fill in all required fields.");
          setLoading(false);
          return;
        }
        
        const newUserId = 'uid-' + Math.random().toString(36).substr(2, 9);
        const newProfile = {
          id: newUserId,
          email: email,
          name: fullName,
          role: role as UserRole,
          tenantId: tenantId,
          createdAt: Date.now(),
          mobileNo,
          bloodGroup,
          address,
          fatherName,
          age
        };

        // Save to backend
        await saveToDatabase('profiles', newProfile);

        setAuth({
          uid: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          tenantId: newProfile.tenantId,
          createdAt: newProfile.createdAt,
          emailVerified: true,
          mobileNo: newProfile.mobileNo,
          bloodGroup: newProfile.bloodGroup,
          address: newProfile.address,
          fatherName: newProfile.fatherName,
          age: newProfile.age
        });
        
        localStorage.setItem('medicore_user', JSON.stringify(newProfile));
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setAuth({
        uid: 'google-mock-' + Math.random().toString(36).substr(2, 9),
        email: 'demo@google.com',
        name: 'Google User',
        role: role || UserRole.ADMIN,
        tenantId: tenantId,
        createdAt: Date.now(),
        emailVerified: true
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex w-full font-sans selection:bg-blue-100">
      {/* LEFT SIDE - Hero Section */}
      <div className="hidden lg:flex lg:w-3/5 xl:w-[55%] bg-gradient-to-br from-blue-600 to-blue-900 text-white p-20 flex-col justify-between relative overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1581595219315-a187dd40c322?auto=format&fit=crop&q=80')",
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">MediCore</span>
        </div>

        <div className="relative z-10 space-y-8 mb-20 max-w-2xl">
          <h1 className="text-6xl font-bold leading-[1.1] tracking-tight">
            Connecting patients<br />
            with the <span className="text-blue-300 relative inline-block">
              care
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-blue-300/50 rounded-full" />
            </span><br />
            they deserve.
          </h1>
          <p className="text-xl text-blue-100 font-light leading-relaxed max-w-lg">
            The intelligent healthcare management platform for hospitals, clinics, and patients. Seamlessly integrate your clinical workflow.
          </p>
        </div>

        {/* Testimonial Section */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl max-w-md shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-lg text-blue-50 font-medium leading-relaxed mb-4">
                  "{testimonials[testimonialIndex].text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-px bg-blue-300/50" />
                  <span className="text-sm font-semibold text-blue-200">
                    {testimonials[testimonialIndex].author}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex gap-2 mt-6">
              {testimonials.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'w-8 bg-blue-400' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Section */}
      <div className="w-full lg:w-2/5 xl:w-[45%] bg-[#fcfdfe] sm:bg-[#f9fafb] flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        <div className="w-full max-w-[400px] flex flex-col items-center">
          <div className="lg:hidden mb-12 flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20">
              <Stethoscope className="text-white w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MediCore</h1>
          </div>

          <div className="w-full space-y-2 mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
              {isSignUp ? 'Create Profile' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Please provide your information to register.' : 'Please enter your credentials to access your account.'}
            </p>
          </div>

          <form onSubmit={handleManualLogin} className="w-full space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
              >
                <Info className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-rose-700 leading-tight">{error}</p>
                </div>
              </motion.div>
            )}

            {isSignUp && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                    <UserCircle2 strokeWidth={2.5} />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                    required={isSignUp}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={mobileNo}
                      onChange={(e) => setMobileNo(e.target.value)}
                      placeholder="Mobile No" 
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                      required={isSignUp}
                    />
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Age" 
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="Father's Name" 
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <select 
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                    >
                      <option value="">Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Address" 
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Mail strokeWidth={2.5} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <UserCircle2 strokeWidth={2.5} />
              </div>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all appearance-none cursor-pointer"
                required
              >
                <option value="" disabled>Select User Role</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.DOCTOR}>Doctor</option>
                <option value={UserRole.PATIENT}>Patient</option>
                <option value={UserRole.NURSE}>Nurse</option>
                <option value={UserRole.RECEPTIONIST}>Receptionist</option>
              </select>
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                <Lock strokeWidth={2.5} />
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full pl-12 pr-16 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:from-blue-700 hover:to-blue-800 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 group mt-2"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  {isSignUp ? 'Create Profile' : 'Initialize Session'}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="w-full mt-8 flex flex-col items-center gap-6">
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-[0.1em]"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="hidden lg:flex absolute bottom-8 left-12 right-12 justify-between text-[10px] uppercase font-bold tracking-widest text-slate-300">
          <span>&copy; 2026 MediCore Infrastructure</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};