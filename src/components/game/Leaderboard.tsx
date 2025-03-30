import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trophy, ChevronLeft, Award, Star, User, History, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp?: number;
}

interface LeaderboardProps {
  currentUser: string;
  currentScore: number;
  onBack: () => void;
}

const Leaderboard = ({ currentUser, currentScore, onBack }: LeaderboardProps) => {
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentLeaderboard, setRecentLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Load leaderboard data from localStorage
    const loadLeaderboard = () => {
      try {
        setIsLoading(true);
        const savedLeaderboard = localStorage.getItem('passwordGameLeaderboard');
        const leaderboardData: LeaderboardEntry[] = savedLeaderboard 
          ? JSON.parse(savedLeaderboard) 
          : [];
        
        // Sort by score (highest first)
        const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
        setAllTimeLeaderboard(sortedData);
        
        // Recent scores - sort by timestamp (most recent first)
        const sortedByRecent = [...leaderboardData]
          .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
          .slice(0, 10); // Only show top 10 recent scores
        setRecentLeaderboard(sortedByRecent);
        
        // Find current user's rank
        const userRank = sortedData.findIndex(entry => entry.username === currentUser) + 1;
        setCurrentUserRank(userRank > 0 ? userRank : null);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeaderboard();
  }, [currentUser]);

  // Add the current user's score to the leaderboard if it doesn't exist yet
  useEffect(() => {
    if (currentUser && currentScore > 0) {
      const saveUserScore = () => {
        try {
          // Get existing leaderboard
          const savedLeaderboard = localStorage.getItem('passwordGameLeaderboard');
          const leaderboardData: LeaderboardEntry[] = savedLeaderboard 
            ? JSON.parse(savedLeaderboard) 
            : [];
          
          // Check if this user already has an entry
          const existingEntryIndex = leaderboardData.findIndex(
            entry => entry.username === currentUser
          );
          
          const timestamp = Date.now();
          
          if (existingEntryIndex >= 0) {
            // Update if the new score is higher
            if (currentScore > leaderboardData[existingEntryIndex].score) {
              leaderboardData[existingEntryIndex] = {
                username: currentUser,
                score: currentScore,
                timestamp
              };
            }
          } else {
            // Add new entry
            leaderboardData.push({
              username: currentUser,
              score: currentScore,
              timestamp
            });
          }
          
          // Save back to localStorage
          localStorage.setItem('passwordGameLeaderboard', JSON.stringify(leaderboardData));
          
          // Update state
          const sortedData = [...leaderboardData].sort((a, b) => b.score - a.score);
          setAllTimeLeaderboard(sortedData);
          
          // Recent scores
          const sortedByRecent = [...leaderboardData]
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 10);
          setRecentLeaderboard(sortedByRecent);
          
          // Update rank
          const userRank = sortedData.findIndex(entry => entry.username === currentUser) + 1;
          setCurrentUserRank(userRank);
        } catch (error) {
          console.error("Error saving score:", error);
        }
      };
      
      saveUserScore();
    }
  }, [currentUser, currentScore]);

  const renderLeaderboardContent = (data: LeaderboardEntry[]) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-primary/20 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-primary/20 rounded mb-2"></div>
            <div className="h-4 w-32 bg-primary/20 rounded"></div>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No scores yet! Be the first to play.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Top 3 players with special styling */}
        {data.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {data.slice(0, Math.min(3, data.length)).map((entry, index) => {
              const medals = [
                { color: "text-yellow-500", size: "h-16 w-16", icon: Award },
                { color: "text-gray-400", size: "h-14 w-14", icon: Award },
                { color: "text-amber-600", size: "h-12 w-12", icon: Award }
              ];
              const { color, size, icon: Icon } = medals[index];
              
              return (
                <motion.div
                  key={`${entry.username}-${index}`}
                  className="flex flex-col items-center p-3"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Icon className={`${color} ${size} mb-2`} />
                  <span className="font-bold text-lg">{index + 1}</span>
                  <div className={`font-semibold truncate w-full text-center flex items-center justify-center gap-1 ${entry.username === currentUser ? "text-primary" : ""}`}>
                    {entry.username === currentUser && <User className="h-3 w-3 text-primary" />}
                    <span className="truncate">{entry.username}</span>
                  </div>
                  <span className="text-sm">{entry.score} pts</span>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Rest of the leaderboard */}
        {data.length > 3 && (
          <div className="bg-card/40 rounded-md overflow-hidden">
            <div className="grid grid-cols-12 bg-secondary/30 py-2 px-3 font-semibold text-sm">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-7">Username</div>
              <div className="col-span-3 text-right">Score</div>
            </div>
            
            <div className="divide-y divide-border/30">
              {data.slice(3).map((entry, index) => (
                <motion.div
                  key={`${entry.username}-${index + 3}`}
                  className={`grid grid-cols-12 py-3 px-3 items-center ${
                    entry.username === currentUser ? "bg-primary/10" : ""
                  }`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                >
                  <div className="col-span-2 text-center text-muted-foreground">
                    {index + 4}
                  </div>
                  <div className="col-span-7 font-medium flex items-center">
                    {entry.username === currentUser ? (
                      <User className="h-4 w-4 text-primary mr-1" />
                    ) : null}
                    {entry.username}
                  </div>
                  <div className="col-span-3 text-right">
                    {entry.score} pts
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Current user info if they're outside top displayed entries */}
        {currentUserRank && currentUserRank > data.length && currentScore > 0 && (
          <div className="mt-4 bg-primary/10 rounded-md p-3 flex items-center justify-between">
            <div className="flex items-center">
              <User className="h-4 w-4 text-primary mr-2" />
              <span className="font-medium">Your Rank: {currentUserRank}</span>
            </div>
            <span>{currentScore} pts</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="card-gradient">
        <CardHeader>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-fit px-2 self-start -mt-1 -ml-2 mb-2"
            onClick={onBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center justify-center">
            <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
            <CardTitle>Password Security Champions</CardTitle>
          </div>
          <CardDescription className="text-center">
            The top password security experts based on challenge performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-time" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="all-time" className="flex items-center">
                <Trophy className="mr-2 h-4 w-4" /> All-Time Best
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center">
                <History className="mr-2 h-4 w-4" /> Recent Scores
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-time">
              {renderLeaderboardContent(allTimeLeaderboard)}
            </TabsContent>
            
            <TabsContent value="recent">
              {renderLeaderboardContent(recentLeaderboard)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Leaderboard;
