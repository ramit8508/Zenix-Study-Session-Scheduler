// Check if running in Electron
const isElectron = window.electron !== undefined;

export const userAPI = {
  update: async (userId, updateData) => {
    try {
      if (isElectron) {
        const response = await window.electron.user.update({ userId, updateData });
        if (response.success) {
          // Update localStorage
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
      } else {
        // Fallback to localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...user, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, data: updatedUser };
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },
};
