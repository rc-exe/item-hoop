import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, User, Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_AUTH_ENABLED = false;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const { signUp, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
      hasMinLength,
      hasUpperCase,
      hasSpecialChar,
      hasNumber,
      isValid:
        hasMinLength && hasUpperCase && hasSpecialChar && hasNumber,
    };
  };

  const passwordValidation = validatePassword(formData.password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValidation.isValid) {
      toast({
        title: "Invalid Password",
        description: "Please meet all password requirements.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.name,
    });

    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account Created",
      description: "You can now log in.",
    });

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Join BarterHub</h1>
          <p className="text-muted-foreground">
            Create your account and start exchanging
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Create Account
            </CardTitle>
            <CardDescription className="text-center">
              Sign up with email
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Google Register – Coming Soon */}
            <Button
              variant="outline"
              className="w-full relative cursor-not-allowed opacity-60"
              disabled={!GOOGLE_AUTH_ENABLED}
            >
              <Mail className="w-4 h-4 mr-2" />
              Continue with Google
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded-full bg-muted border">
                Coming Soon
              </span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      handleChange("email", e.target.value)
                    }
                    required
                    disabled={loading}
                  />
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleChange("password", e.target.value)
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full"
                    onClick={() =>
                      setShowPassword((v) => !v)
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {formData.password && (
                  <div className="text-xs space-y-1">
                    {[
                      ["8 characters", passwordValidation.hasMinLength],
                      ["Uppercase letter", passwordValidation.hasUpperCase],
                      ["Special character", passwordValidation.hasSpecialChar],
                      ["Number", passwordValidation.hasNumber],
                    ].map(([label, ok]) => (
                      <div
                        key={label as string}
                        className={`flex items-center gap-2 ${
                          ok ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {ok ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleChange(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full"
                    onClick={() =>
                      setShowConfirmPassword((v) => !v)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={formData.agreeToTerms}
                  onCheckedChange={(v) =>
                    handleChange("agreeToTerms", Boolean(v))
                  }
                />
                <span className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account…
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary ml-1">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
