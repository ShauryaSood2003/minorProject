'use client'

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, ArrowLeft, Camera } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState('/placeholder.svg')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  })
  const [loading, setLoading] = useState(true) // State to show loading
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("id");

      if (!userId || !token) {
        console.error("User ID or access token is missing!");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/v1/billing/userProfile", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (response.ok) {
          setFormData({
            name: data.data.name,
            email: data.data.email,
            bio: data.data.bio || '', // Fallback to empty bio if not provided
          });
        } else {
          console.error("Error fetching profile:", data.message);
          setError(data.message || "Failed to fetch profile.");
        }
      } catch (err) {
        console.error("Network error:", err);
        setError("Network error occurred while fetching profile.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Updating profile with:', formData);
      setIsEditing(false);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating an API call
      console.log('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View and edit your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profileImage} alt="Profile picture" />
                    <AvatarFallback>{formData.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div>
                      <input
                        type="file"
                        id="profile-image"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <Camera className="h-4 w-4" />
                          <span>Change profile picture</span>
                        </div>
                      </Label>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" onClick={handleSubmit}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
