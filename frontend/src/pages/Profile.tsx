import { useState, type FormEvent } from 'react';
import { CheckCircle2, ShieldCheck, Lock, AlertCircle, Save, KeyRound, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, updateProfile, updatePassword } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Kumar');
  const [phone, setPhone] = useState(profile?.phone || '9876543210');
  const [city, setCity] = useState(profile?.city || 'Hosur Town, Tamil Nadu');
  const [bio, setBio] = useState(profile?.bio || '');
  const [allowWhatsapp, setAllowWhatsapp] = useState(profile?.allow_whatsapp !== false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: 'error', text: 'Avatar must be less than 5MB' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatar-${user?.id || 'user'}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          setAvatarUrl(publicData.publicUrl);
          await updateProfile({ avatar_url: publicData.publicUrl });
          setProfileMsg({ type: 'success', text: 'Avatar uploaded successfully!' });
        }
      } else {
        const localUrl = URL.createObjectURL(file);
        setAvatarUrl(localUrl);
        await updateProfile({ avatar_url: localUrl });
        setProfileMsg({ type: 'success', text: 'Avatar preview updated!' });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    const { error } = await updateProfile({
      full_name: fullName,
      phone,
      city,
      bio,
      allow_whatsapp: allowWhatsapp,
      avatar_url: avatarUrl,
    });

    setSavingProfile(false);
    if (error) {
      setProfileMsg({ type: 'error', text: error });
    } else {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMsg(null), 3000);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    setSavingPassword(false);

    if (error) {
      setPasswordMsg({ type: 'error', text: error });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    }
  };

  const initial = fullName.charAt(0).toUpperCase() || 'K';
  const displayRole = profile?.role || 'user';

  return (
    <div className="space-y-8">
      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Profile Settings</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your public seller profile and contact details</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
            displayRole === 'admin' ? 'bg-purple-100 text-purple-800' :
            displayRole === 'seller' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
          }`}>
            Role: {displayRole}
          </span>
        </div>

        {profileMsg && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            profileMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
            <span>{profileMsg.text}</span>
          </div>
        )}
        
        <form onSubmit={handleProfileSubmit}>
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <div className="w-28 h-28 bg-brand text-white rounded-2xl flex items-center justify-center text-4xl font-black shadow-md overflow-hidden border-2 border-brand-light">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{initial}</span>
                  )}
                </div>

                <label
                  htmlFor="avatar-file-input"
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-gray-900 text-white hover:bg-brand rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-colors"
                  title="Upload profile picture"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>

              <span className="text-[11px] text-gray-500 font-medium">Click camera icon to upload</span>

              <div className="flex flex-col gap-2 w-full text-center mt-2">
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mobile Verified
                </div>
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <ShieldCheck className="h-3.5 w-3.5" /> Email Active
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field py-2.5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || user?.email || 'user@example.com'}
                  className="input-field py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Location in Hosur</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field py-2.5"
                >
                  <option value="Hosur Town, Tamil Nadu">Hosur Town, Tamil Nadu</option>
                  <option value="SIPCOT Phase 1, Hosur">SIPCOT Phase 1, Hosur</option>
                  <option value="Mathigiri, Hosur">Mathigiri, Hosur</option>
                  <option value="Bagalur Road, Hosur">Bagalur Road, Hosur</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Bio / Description</label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell buyers a little about what you sell..."
                  className="input-field py-2"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={allowWhatsapp}
                  onChange={(e) => setAllowWhatsapp(e.target.checked)}
                  className="rounded text-brand focus:ring-brand h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Receive buyer inquiries on WhatsApp</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary px-6 py-2.5 flex items-center gap-2 font-bold shadow-sm"
            >
              <Save className="h-4 w-4" />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Security & Password</h2>
            <p className="text-xs text-gray-500">Update your account password</p>
          </div>
        </div>

        {passwordMsg && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
            passwordMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input-field pl-9 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Confirm New Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="input-field pl-9 py-2.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="btn btn-outline px-6 py-2.5 font-bold hover:bg-gray-50"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
