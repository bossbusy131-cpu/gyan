export interface UserProfile {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  className?: string;
  stateBoard?: string;
  token?: string;
  isLoggedIn: boolean;
  loginDate?: string;
  avatar?: string;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'userData';

export const authService = {
  getStoredUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const token = localStorage.getItem(TOKEN_KEY) || parsed.token || '';
        return {
          ...parsed,
          token,
          isLoggedIn: true,
        };
      }
    } catch (e) {
      console.warn('Failed to parse stored user data', e);
    }
    return null;
  },

  saveSession(token: string, userData: Partial<UserProfile>): UserProfile {
    const user: UserProfile = {
      id: userData.id || 'tb_' + Date.now().toString(36),
      fullName: userData.fullName || 'TargetBoard Student',
      mobile: userData.mobile || '',
      email: userData.email || '',
      className: userData.className || 'Class 12th Board 2026-27',
      stateBoard: userData.stateBoard || 'Bihar School Examination Board (BSEB)',
      token,
      isLoggedIn: true,
      loginDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        userData.fullName || 'student'
      )}`,
    };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async sendOtp(mobile: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/tb/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send OTP from TargetBoard');
      }
      return { success: true, message: data.message || 'OTP sent successfully to your mobile number' };
    } catch (err: any) {
      throw new Error(err?.message || 'TargetBoard server error. Please check your internet connection.');
    }
  },

  async verifyOtp(mobile: string, code: string): Promise<{ token: string; user: any; tempToken?: string }> {
    const res = await fetch('/api/tb/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, code }),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      throw new Error('TargetBoard server did not respond. Please try again.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Invalid OTP code. Please enter the valid code sent to your phone.');
    }

    if (data.token) {
      return {
        token: data.token,
        user: data.user || {
          fullName: 'TargetBoard Student',
          mobile,
        },
      };
    }

    if (data.tempToken) {
      return {
        token: '',
        tempToken: data.tempToken,
        user: { mobile },
      };
    }

    throw new Error(data.message || 'TargetBoard verification failed');
  },

  async registerStep1(fullName: string, tempToken: string): Promise<boolean> {
    const res = await fetch('/api/tb/auth/register-step-1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tempToken}`,
      },
      body: JSON.stringify({ fullName }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration Step 1 failed');
    }
    return true;
  },

  async registerStep2(params: {
    classId: string;
    stateBoardId: string;
    mediumId: string;
    city?: string;
    tempToken: string;
  }): Promise<{ token: string; user: any }> {
    const res = await fetch('/api/tb/auth/register-step-2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.tempToken}`,
      },
      body: JSON.stringify({
        classId: params.classId,
        stateBoardId: params.stateBoardId,
        mediumId: params.mediumId,
        city: params.city || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.token) {
      throw new Error(data.message || 'Registration Step 2 failed');
    }
    return {
      token: data.token,
      user: data.user,
    };
  },

  async fetchVideoToken(assetId: string): Promise<string | null> {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const res = await fetch(`/api/tb/tpstreams/token/${encodeURIComponent(assetId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.code) return data.code;
      }
    } catch (err) {
      console.warn('Failed to fetch TPStreams video token', err);
    }
    return null;
  },
};
