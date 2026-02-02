// Check if running in Electron
const isElectron = window.electron !== undefined;

export const userAPI = {
  update: async (userId, updateData) => {
    try {
      // For device-based auth, always update localStorage directly
      const userStr = localStorage.getItem('user') || localStorage.getItem('deviceUser');
      const user = (userStr && userStr !== 'undefined' && userStr !== 'null') 
        ? JSON.parse(userStr) 
        : {};
      
      const updatedUser = { 
        ...user, 
        ...updateData,
        updated_at: new Date().toISOString()
      };
      
      // Update both user and deviceUser in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('deviceUser', JSON.stringify(updatedUser));
      
      // Try to update backend if in Electron (optional)
      if (isElectron && user?.id) {
        try {
          await window.electron.user.update({ userId, updateData });
        } catch (error) {
          console.log('Backend update failed, using localStorage only:', error);
        }
      }
      
      return { success: true, data: updatedUser, message: 'Profile updated successfully' };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: error.message };
    }
  },
};
