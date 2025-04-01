import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { 
  History, 
  Trash, 
  AlertTriangle, 
  Info, 
  Plus,
  TrendingUp,
  BarChart,
  Activity,
  Eye,
  AlertCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";

interface StoredPassword {
  id: string;
  password: string;
  createdAt: Date;
  entropy: number;
  labels: string[];
}

const PasswordHistory = () => {
  const [passwords, setPasswords] = useState<StoredPassword[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordLabel, setNewPasswordLabel] = useState("");
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState<string | null>(null);
  const [similarityAlert, setSimilarityAlert] = useState<{open: boolean, message: string}>({
    open: false,
    message: ""
  });
  
  // Load passwords from localStorage on component mount
  useEffect(() => {
    const storedPasswords = localStorage.getItem("passwordHistory");
    if (storedPasswords) {
      try {
        // Parse JSON and convert date strings back to Date objects
        const parsedPasswords = JSON.parse(storedPasswords).map((pw: any) => ({
          ...pw,
          createdAt: new Date(pw.createdAt)
        }));
        setPasswords(parsedPasswords);
      } catch (error) {
        console.error("Error loading passwords:", error);
      }
    } else {
      // Initialize with some sample data if none exists
      const samplePasswords: StoredPassword[] = [
        {
          id: "1",
          password: "pa$$w0rd123",
          createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000), // 50 days ago
          entropy: 45,
          labels: ["Email"]
        },
        {
          id: "2",
          password: "Tr0ub4dor&3",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          entropy: 60,
          labels: ["Work"]
        },
        {
          id: "3",
          password: "c0rrect-horse-battery-staple",
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          entropy: 85,
          labels: ["Banking"]
        }
      ];
      
      setPasswords(samplePasswords);
      localStorage.setItem("passwordHistory", JSON.stringify(samplePasswords));
    }
  }, []);
  
  // Save passwords to localStorage whenever they change
  useEffect(() => {
    if (passwords.length > 0) {
      localStorage.setItem("passwordHistory", JSON.stringify(passwords));
    }
  }, [passwords]);
  
  // Calculate password entropy
  const calculateEntropy = (password: string): number => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasDigit) poolSize += 10;
    if (hasSpecial) poolSize += 33;
    
    return Math.round(password.length * Math.log2(poolSize || 1) * 100) / 100;
  };
  
  // Check for similarities between passwords
  const checkSimilarities = (newPwd: string): boolean => {
    // Don't check if there are no existing passwords
    if (passwords.length === 0) return false;
    
    // Check for direct substring relationships
    const isSubstring = passwords.some(pwd => 
      pwd.password.includes(newPwd) || newPwd.includes(pwd.password)
    );
    
    if (isSubstring) {
      setSimilarityAlert({
        open: true,
        message: "Warning: This password contains or is contained within one of your previous passwords. This creates a security risk as attackers could guess it by modifying your old passwords."
      });
      return true;
    }
    
    // Check for character similarity (e.g., only a few characters different)
    const similarPasswords = passwords.filter(pwd => {
      // Calculate Levenshtein distance (simplified version for demo)
      const distance = levenshteinDistance(pwd.password, newPwd);
      const maxLength = Math.max(pwd.password.length, newPwd.length);
      const similarity = 1 - (distance / maxLength);
      
      // If more than 70% similar, flag it
      return similarity > 0.7;
    });
    
    if (similarPasswords.length > 0) {
      setSimilarityAlert({
        open: true,
        message: "Warning: This password is very similar to one of your previous passwords. Using similar passwords reduces your security against attackers who may have compromised your previous passwords."
      });
      return true;
    }
    
    // Check for pattern similarities (e.g., incrementing numbers at the end)
    const hasIncrementalPattern = passwords.some(pwd => {
      // Extract any trailing numbers from both passwords
      const currentTrailingNumber = pwd.password.match(/(\d+)$/);
      const newTrailingNumber = newPwd.match(/(\d+)$/);
      
      if (currentTrailingNumber && newTrailingNumber) {
        // Get the non-numeric parts
        const currentBase = pwd.password.replace(/\d+$/, '');
        const newBase = newPwd.replace(/\d+$/, '');
        
        // If the bases are the same and the numbers are sequential
        if (currentBase === newBase) {
          const currentNum = parseInt(currentTrailingNumber[0], 10);
          const newNum = parseInt(newTrailingNumber[0], 10);
          
          // Check if the numbers are sequential or have a simple pattern
          return Math.abs(currentNum - newNum) <= 2;
        }
      }
      
      return false;
    });
    
    if (hasIncrementalPattern) {
      setSimilarityAlert({
        open: true,
        message: "Warning: This password follows a predictable pattern based on your previous passwords. Attackers commonly try variations like incrementing numbers or changing a few characters."
      });
      return true;
    }
    
    return false;
  };
  
  // Levenshtein distance calculation for similarity checking
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    return matrix[b.length][a.length];
  };
  
  const addPassword = () => {
    if (!newPassword.trim()) return;
    
    // Check for similarities with existing passwords
    const hasSimilarities = checkSimilarities(newPassword);
    
    // If there are similarities, the dialog is shown but we still allow adding
    // the password if the user acknowledges the warning
    
    if (!hasSimilarities) {
      // Only add the password immediately if no similarities were found
      const entropy = calculateEntropy(newPassword);
      
      const password: StoredPassword = {
        id: Date.now().toString(),
        password: newPassword,
        createdAt: new Date(),
        entropy,
        labels: newPasswordLabel ? [newPasswordLabel] : []
      };
      
      setPasswords([...passwords, password]);
      setNewPassword("");
      setNewPasswordLabel("");
      setShowAddPassword(false);
      
      toast.success("Password added to history");
    }
  };
  
  const confirmAddSimilarPassword = () => {
    const entropy = calculateEntropy(newPassword);
    
    const password: StoredPassword = {
      id: Date.now().toString(),
      password: newPassword,
      createdAt: new Date(),
      entropy,
      labels: newPasswordLabel ? [newPasswordLabel] : []
    };
    
    setPasswords([...passwords, password]);
    setNewPassword("");
    setNewPasswordLabel("");
    setShowAddPassword(false);
    setSimilarityAlert({ open: false, message: "" });
    
    toast.success("Password added to history despite similarity warning");
  };
  
  const confirmDeletePassword = () => {
    if (passwordToDelete) {
      setPasswords(passwords.filter(pwd => pwd.id !== passwordToDelete));
      setPasswordToDelete(null);
      setOpenDeleteDialog(false);
      toast.success("Password removed from history");
    }
  };
  
  const getEntropyColor = (entropy: number) => {
    if (entropy < 40) return "text-red-500";
    if (entropy < 60) return "text-yellow-500";
    if (entropy < 80) return "text-green-500";
    return "text-emerald-500";
  };
  
  const getEntropyTrend = () => {
    if (passwords.length < 2) return null;
    
    // Sort passwords by creation date
    const sortedPasswords = [...passwords].sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
    
    // Calculate average entropy
    const avgEntropy = sortedPasswords.reduce((sum, pwd) => sum + pwd.entropy, 0) / sortedPasswords.length;
    
    // Check if entropy is increasing
    const firstHalf = sortedPasswords.slice(0, Math.floor(sortedPasswords.length / 2));
    const secondHalf = sortedPasswords.slice(Math.floor(sortedPasswords.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, pwd) => sum + pwd.entropy, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, pwd) => sum + pwd.entropy, 0) / secondHalf.length;
    
    const trending = secondHalfAvg > firstHalfAvg ? "up" : "down";
    
    return {
      avgEntropy,
      trending,
      firstHalfAvg,
      secondHalfAvg
    };
  };
  
  const getScatterChartData = () => {
    return passwords.map(pwd => ({
      name: new Date(pwd.createdAt).toLocaleDateString(),
      x: new Date(pwd.createdAt).getTime(),
      y: pwd.entropy,
      password: maskPassword(pwd.password),
      label: pwd.labels.join(", ") || "No label"
    }));
  };
  
  const maskPassword = (password: string) => {
    if (password.length <= 4) return "****";
    return password.substring(0, 2) + "****" + password.substring(password.length - 2);
  };
  
  const entropyTrend = getEntropyTrend();
  const chartData = getScatterChartData();
  
  const getAverageEntropyColor = () => {
    if (!entropyTrend) return "text-muted-foreground";
    
    if (entropyTrend.avgEntropy < 40) return "text-red-500";
    if (entropyTrend.avgEntropy < 60) return "text-yellow-500";
    if (entropyTrend.avgEntropy < 80) return "text-green-500";
    return "text-emerald-500";
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <History className="mr-2" size={20} />
          Password History & Analysis
        </CardTitle>
        <CardDescription>
          Track your passwords over time and analyze patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Password History</h3>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center text-xs"
            onClick={() => setShowAddPassword(!showAddPassword)}
          >
            <Plus size={14} className="mr-1" />
            Add Password
          </Button>
        </div>
        
        {showAddPassword && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-md">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter password to add to history"
                  type="password"
                />
                <Button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("new-password") as HTMLInputElement;
                    if (input) {
                      input.type = input.type === "password" ? "text" : "password";
                    }
                  }}
                >
                  <Eye size={14} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password-label" className="text-xs">Label (optional)</Label>
              <Input
                id="new-password-label"
                value={newPasswordLabel}
                onChange={(e) => setNewPasswordLabel(e.target.value)}
                placeholder="e.g., Banking, Social Media, Email"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowAddPassword(false);
                  setNewPassword("");
                  setNewPasswordLabel("");
                }}
              >
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={addPassword}
                disabled={!newPassword.trim()}
              >
                Add to History
              </Button>
            </div>
          </div>
        )}
        
        {passwords.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-md">
                <div className="text-xs text-muted-foreground">Total Passwords</div>
                <div className="text-2xl font-bold">{passwords.length}</div>
              </div>
              
              <div className="p-3 bg-secondary/30 rounded-md">
                <div className="text-xs text-muted-foreground">Average Strength</div>
                <div className={`text-2xl font-bold ${getAverageEntropyColor()}`}>
                  {entropyTrend ? Math.round(entropyTrend.avgEntropy) : "N/A"} bits
                  {entropyTrend && (
                    <span className={`ml-2 text-sm ${entropyTrend.trending === "up" ? "text-green-500" : "text-red-500"}`}>
                      {entropyTrend.trending === "up" ? "↗" : "↘"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="rounded-md border border-border overflow-hidden">
              <div className="p-3 bg-secondary/30">
                <h4 className="text-sm font-medium flex items-center">
                  <BarChart size={14} className="mr-1" />
                  Password Strength Over Time
                </h4>
              </div>
              
              <div className="h-[200px] p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.15} />
                    <XAxis 
                      dataKey="name" 
                      type="category"
                      tickFormatter={(value) => value.split('/').slice(0, 2).join('/')}
                      fontSize={10}
                    />
                    <YAxis 
                      label={{ value: 'Entropy (bits)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                      fontSize={10}
                    />
                    <Tooltip 
                      formatter={(value, name, props) => [
                        `${value} bits`,
                        'Password Strength'
                      ]}
                      labelFormatter={(value) => `Date: ${value}`}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="y" 
                      name="Entropy" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Activity size={14} className="mr-1" />
                Password Details
              </h4>
              
              <ScrollArea className="h-[180px] rounded-md border p-2">
                <div className="space-y-2">
                  {[...passwords]
                    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map(password => (
                      <div 
                        key={password.id} 
                        className="flex justify-between items-start p-2 rounded border border-border/40 hover:bg-secondary/30"
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{maskPassword(password.password)}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <span>{new Date(password.createdAt).toLocaleDateString()}</span>
                            {password.labels.length > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-secondary/50 rounded text-[10px]">
                                {password.labels[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-medium ${getEntropyColor(password.entropy)}`}>
                            {password.entropy} bits
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setPasswordToDelete(password.id);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Trash size={12} className="text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
            
            {entropyTrend && (
              <div className="p-3 bg-muted/30 rounded-md">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <Info size={14} className="mr-1" />
                  AI Insights
                </h4>
                <p className="text-xs text-muted-foreground">
                  {entropyTrend.trending === "up" ? (
                    "Your password security is improving over time. Keep up the good work by using strong, unique passwords for each account."
                  ) : (
                    "Your newer passwords appear to be less secure than your older ones. Consider using a password manager to generate and store stronger passwords."
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        
        {passwords.length === 0 && (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium mb-1">No Password History</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add passwords to start tracking your security trends
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowAddPassword(true)}
            >
              <Plus size={16} className="mr-1" />
              Add First Password
            </Button>
          </div>
        )}
      </CardContent>
      
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Password</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this password from your history?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePassword}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={similarityAlert.open} onOpenChange={(open) => setSimilarityAlert({...similarityAlert, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-amber-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Password Similarity Warning
            </AlertDialogTitle>
            <AlertDialogDescription>
              {similarityAlert.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddSimilarPassword}>
              Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// Shared Label component for the form
const Label = ({ htmlFor, className, children }: { htmlFor: string; className?: string; children: React.ReactNode }) => (
  <label 
    htmlFor={htmlFor}
    className={`text-sm font-medium ${className || ""}`}
  >
    {children}
  </label>
);

export default PasswordHistory;
