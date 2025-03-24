"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/app/backend/auth.service";





interface SignUpFormData {
  password: string;
  confirmPassword: string;
  email: string;
}

const SignUpForm = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    password: "",
    confirmPassword: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {


      if (!formData.email) {
        throw new Error("Email is required");
      }

      if (formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Call auth service to handle signup
      const authService = new AuthService();
      const { user } = await authService.signUp({
        email: formData.email,
        password: formData.password,
      });


      // TODO: Redirect to dashboard or login page
      console.log("User signed up successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          

          {/* Email Field */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password Field */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

         

        

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing up..." : "Sign Up"}
          </Button>

          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;