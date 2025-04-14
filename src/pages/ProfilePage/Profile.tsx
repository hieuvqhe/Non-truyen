import React, { useState, useEffect, useRef } from "react";
import {  Mail, Shield, BookOpen, ChevronRight, Save, Edit, X, Lock, Eye, EyeOff, Key, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TiltedCard from "../../components/TiltedCard";
import { getReadingList, updateProfile, getProfile, changePassword } from "../../apis/user.api";
import comicApi from "../../apis/comic.api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { toast } from "sonner";
import { UpdateProfileRequest, User as UserType, ChangePasswordRequest } from "../../types/User.type";
import useAuthStore from "../../store/authStore";


interface ComicDetail {
  title: string;
  thumbnail: string;
  slug: string;
  lastReadChapter: string;
}

// Custom Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent scrolling of the body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-background border border-border w-full max-w-md rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user: storeUser, updateUserData, isAuthenticated } = useAuthStore();
  const [userData, setUserData] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingList, setReadingList] = useState<ComicDetail[]>([]);
  const [readingListLoading, setReadingListLoading] = useState(false);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user data from API on component mount
  useEffect(() => {
    // Set page title
    document.title = "Hồ sơ của tôi | Non Truyện";
    
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // First check if user exists in store
        if (storeUser && Object.keys(storeUser).length > 0) {
          setUserData(storeUser as unknown as UserType);
          setName(storeUser.name || "");
          setPhone((storeUser as unknown as UserType).phone || "");
          setAddress((storeUser as unknown as UserType).address || "");
          setLoading(false);
        } else {
          // Fallback to API
          const response = await getProfile();
          if (response && response.user) {
            // Update both local state and store
            setUserData(response.user);
            updateUserData(response.user);
            
            // Initialize form values
            setName(response.user.name || "");
            setPhone(response.user.phone || "");
            setAddress(response.user.address || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        toast.error("Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      // Redirect to login if not authenticated
      navigate('/login', { replace: true });
    }

    return () => {
      document.title = "Non Truyện";
    };
  }, [storeUser, isAuthenticated, navigate, updateUserData]);

  // Fetch reading list
  useEffect(() => {
    const fetchReadingList = async () => {
      if (!userData) return;
      
      try {
        setReadingListLoading(true);
        const response = await getReadingList(1, 5);
        
        // Check if response data exists before mapping
        if (response && response.data && Array.isArray(response.data)) {
          // For each item in the reading list, fetch comic details
          const comicDetailsPromises = response.data.map(async (item) => {
            try {
              const comicDetail = await comicApi.getDetail(item.slug);
              return {
                title: comicDetail.title,
                thumbnail: comicDetail.thumbnail,
                slug: item.slug,
                lastReadChapter: item.lastReadChapter
              };
            } catch (err) {
              console.error(`Error fetching details for comic ${item.slug}:`, err);
              return null;
            }
          });
          
          const comicDetails = (await Promise.all(comicDetailsPromises)).filter(
            (comic): comic is ComicDetail => comic !== null
          );
          setReadingList(comicDetails);
        } else {
          console.error("Invalid response format:", response);
          setReadingList([]);
        }
      } catch (error) {
        console.error("Failed to fetch reading list:", error);
        setReadingList([]);
      } finally {
        setReadingListLoading(false);
      }
    };

    fetchReadingList();
  }, [userData]);

  const handleViewComic = (slug: string) => {
    navigate(`/truyen-tranh/${slug}`);
  };

  const handleViewAllReadings = () => {
    navigate("/readings");
  };
  
  // Avatar handling functions
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (500KB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        toast.error("Kích thước file không được vượt quá 500KB");
        return;
      }
      
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Profile edit functions
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
      setAvatarPreview("");
      setAvatar(null);
      
      // Reset form values
      if (userData) {
        setName(userData.name || "");
        setPhone(userData.phone || "");
        setAddress(userData.address || "");
      }
    } else {
      setIsEditing(true);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData) return;
    
    try {
      setUpdateLoading(true);
      
      const profileData: UpdateProfileRequest = {
        name,
        phone,
        address,
        avatar
      };
      
      const result = await updateProfile(profileData);
      
      if (result && result.user) {
        // Update component state with new user data
        setUserData(result.user);
        
        // Also update the global store
        updateUserData(result.user);
        
        setIsEditing(false);
        setAvatarPreview("");
        setAvatar(null);
        
        toast.success("Cập nhật thông tin thành công");
      }
      
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật thông tin");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Password change handler
  const validatePasswordForm = () => {
    // Clear previous errors
    setPasswordError("");
    
    // Check if old password is entered
    if (!oldPassword) {
      setPasswordError("Vui lòng nhập mật khẩu hiện tại");
      return false;
    }
    
    // Check if new password is entered
    if (!newPassword) {
      setPasswordError("Vui lòng nhập mật khẩu mới");
      return false;
    }
    
    // Check if new password is at least 6 characters long
    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return false;
    }
    
    // Check if old and new passwords are the same
    if (oldPassword === newPassword) {
      setPasswordError("Mật khẩu mới phải khác mật khẩu cũ");
      return false;
    }
    
    return true;
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userData || !userData.email) return;
    
    if (!validatePasswordForm()) return;
    
    try {
      setChangingPassword(true);
      
      const passwordData: ChangePasswordRequest = {
        email: userData.email,
        oldPassword,
        newPassword
      };
      
      await changePassword(passwordData);
      
      // Reset form
      setOldPassword("");
      setNewPassword("");
      
      toast.success("Đổi mật khẩu thành công");
    } catch (error) {
      console.error("Failed to change password:", error);
      
      if (error instanceof Error) {
        // If the error message includes "incorrect", it's likely about the old password
        if (error.message.toLowerCase().includes("incorrect")) {
          setPasswordError("Mật khẩu hiện tại không chính xác");
        } else {
          setPasswordError(error.message);
        }
      } else {
        setPasswordError("Đã xảy ra lỗi khi đổi mật khẩu");
      }
      
      toast.error("Không thể đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  // Toggle password modal
  const togglePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal);
    if (!showPasswordModal) {
      // Reset form when opening modal
      setOldPassword("");
      setNewPassword("");
      setPasswordError("");
      setShowOldPassword(false);
      setShowNewPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 dark:text-white">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8 dark:text-white">
          Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Hồ sơ của tôi</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={togglePasswordModal}
            aria-label="Thay đổi mật khẩu"
            tabIndex={0}
          >
            <KeyRound className="mr-2 h-4 w-4" /> Thay đổi mật khẩu
          </Button>
          <Button 
            variant={isEditing ? "destructive" : "default"} 
            onClick={handleEditToggle}
            aria-label={isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa thông tin"}
            tabIndex={0}
          >
            {isEditing ? (
              <><X className="mr-2 h-4 w-4" /> Hủy</>
            ) : (
              <><Edit className="mr-2 h-4 w-4" /> Chỉnh sửa</>
            )}
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* User Avatar and Basic Info */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200 h-full">
              <div className="flex flex-col items-center">
                <div 
                  className={`relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 ${
                    isEditing ? 'cursor-pointer border-blue-500 hover:border-blue-600' : 'border-blue-500'
                  } dark:border-blue-400 transition-colors duration-200`}
                  onClick={handleAvatarClick}
                >
                  <img 
                    src={avatarPreview || userData.avatar} 
                    alt={userData.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://cdn.vectorstock.com/i/1000x1000/44/01/default-avatar-photo-placeholder-icon-grey-vector-38594401.webp";
                    }}
                  />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <p className="text-white text-sm font-medium text-center px-2">Nhấn để thay đổi ảnh đại diện</p>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {isEditing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên của bạn"
                    className="text-center mb-2"
                    required
                  />
                ) : (
                  <h2 className="text-xl font-bold dark:text-white transition-colors duration-200">{userData.name}</h2>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize transition-colors duration-200">{userData.role}</p>
              </div>
            </div>
          </div>
          
          {/* User Details */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200 h-full">
              <h2 className="text-xl font-bold mb-6 dark:text-white transition-colors duration-200">Thông tin cá nhân</h2>
              
              <div className="space-y-6">
                {/* Email */}
                <div className="flex items-start">
                  <div className="mr-3 p-2 bg-green-100 dark:bg-green-900 rounded-full transition-colors duration-200">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-300 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Email</h3>
                    <p className="text-gray-800 dark:text-white transition-colors duration-200">{userData.email}</p>
                  </div>
                </div>
                
                {/* Phone */}
                {/* <div className="flex items-start">
                  <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900 rounded-full transition-colors duration-200">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-300 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Số điện thoại</h3>
                    {isEditing ? (
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white transition-colors duration-200">
                        {userData.phone || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>
                </div>
                 */}
                {/* Address */}
                {/* <div className="flex items-start">
                  <div className="mr-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full transition-colors duration-200">
                    <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-300 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Địa chỉ</h3>
                    {isEditing ? (
                      <Textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nhập địa chỉ của bạn"
                        className="resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-white transition-colors duration-200">
                        {userData.address || "Chưa cập nhật"}
                      </p>
                    )}
                  </div>
                </div> */}
                
                {/* Role */}
                <div className="flex items-start">
                  <div className="mr-3 p-2 bg-purple-100 dark:bg-purple-900 rounded-full transition-colors duration-200">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-300 transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Vai trò</h3>
                    <p className="text-gray-800 dark:text-white capitalize transition-colors duration-200">{userData.role}</p>
                  </div>
                </div>
                
                {/* Save button */}
                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      disabled={updateLoading}
                      aria-label="Lưu thay đổi"
                    >
                      {updateLoading ? (
                        "Đang lưu..."
                      ) : (
                        <><Save className="mr-2 h-4 w-4" /> Lưu thay đổi</>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={togglePasswordModal}
        title="Thay đổi mật khẩu"
      >
        <form onSubmit={handleChangePassword} className="space-y-6">
          {/* Email field (readonly) */}
          <div className="flex items-start">
            <div className="mr-3 p-2 bg-green-100 dark:bg-green-900 rounded-full transition-colors duration-200">
              <Mail className="w-5 h-5 text-green-600 dark:text-green-300 transition-colors duration-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Email</h3>
              <Input
                value={userData?.email || ""}
                readOnly
                disabled
                className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
          
          {/* Old Password */}
          <div className="flex items-start">
            <div className="mr-3 p-2 bg-red-100 dark:bg-red-900 rounded-full transition-colors duration-200">
              <Key className="w-5 h-5 text-red-600 dark:text-red-300 transition-colors duration-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Mật khẩu hiện tại</h3>
              <div className="relative">
                <Input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  tabIndex={0}
                  aria-label={showOldPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* New Password */}
          <div className="flex items-start">
            <div className="mr-3 p-2 bg-blue-100 dark:bg-blue-900 rounded-full transition-colors duration-200">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-300 transition-colors duration-200" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 transition-colors duration-200">Mật khẩu mới</h3>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  className="pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={0}
                  aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error display */}
          {passwordError && (
            <div className="text-destructive text-sm px-2">
              {passwordError}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={togglePasswordModal}
              tabIndex={0}
              aria-label="Hủy"
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              disabled={changingPassword}
              aria-label="Đổi mật khẩu"
              tabIndex={0}
            >
              {changingPassword ? (
                "Đang xử lý..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Đổi mật khẩu
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Reading List Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Truyện đang đọc</h2>
          <button 
            onClick={handleViewAllReadings} 
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
            aria-label="Xem tất cả truyện đang đọc"
            tabIndex={0}
          >
            Xem tất cả <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
        
        {readingListLoading ? (
          <div className="text-center py-8 dark:text-white">Đang tải danh sách truyện...</div>
        ) : readingList.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-200 dark:text-white">
            Bạn chưa đọc truyện nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {readingList.map((comic, index) => (
              <div 
                key={index} 
                className="flex flex-col cursor-pointer transition-transform hover:scale-105" 
                onClick={() => handleViewComic(comic.slug)}
              >
                <TiltedCard
                  imageSrc={comic.thumbnail || "https://picsum.photos/seed/placeholder/800/600"}
                  altText={comic.title || "Comic image"}
                  captionText=""
                  containerHeight="240px"
                  containerWidth="100%"
                  imageHeight="240px"
                  imageWidth="160px"
                  scaleOnHover={1.1}
                  rotateAmplitude={14}
                  showMobileWarning={true}
                  showTooltip={true}
                  overlayContent={
                    <div className="text-white text-xs p-1 bg-black bg-opacity-70">
                      Chap {comic.lastReadChapter}
                    </div>
                  }
                  displayOverlayContent={true}
                />
                <div className="mt-2">
                  <h3 className="font-semibold text-sm truncate text-gray-800 dark:text-gray-100">
                    {comic.title}
                  </h3>
                  <div className="flex items-center mt-1 justify-center">
                    <BookOpen
                      size={14}
                      className="text-blue-600 dark:text-blue-400 mr-1 transition-colors duration-200"
                    />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
                      Đang đọc: Chap {comic.lastReadChapter}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;