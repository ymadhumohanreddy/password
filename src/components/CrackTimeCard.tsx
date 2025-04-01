import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap, Cpu, Server, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface CrackTimesProps {
  crackTimes: Record<string, string>;
}

const CrackTimeCard = ({ crackTimes }: CrackTimesProps) => {
  const [activeView, setActiveView] = useState<"basic" | "advanced">("basic");
  
  const getTimeColor = (time: string) => {
    if (time.includes("years") && !time.includes("0.")) {
      return "text-green-500";
    } else if (time.includes("months") || time.includes("days")) {
      return "text-yellow-500";
    } else {
      return "text-destructive";
    }
  };

  const parseTimeToSeconds = (timeStr: string): number => {
    if (timeStr.includes("sec")) {
      return parseFloat(timeStr.split(" ")[0]);
    } else if (timeStr.includes("min")) {
      return parseFloat(timeStr.split(" ")[0]) * 60;
    } else if (timeStr.includes("hr")) {
      return parseFloat(timeStr.split(" ")[0]) * 3600;
    } else if (timeStr.includes("days")) {
      return parseFloat(timeStr.split(" ")[0]) * 86400;
    } else if (timeStr.includes("months")) {
      return parseFloat(timeStr.split(" ")[0]) * 2592000;
    } else if (timeStr.includes("years")) {
      return parseFloat(timeStr.split(" ")[0]) * 31536000;
    }
    return 0;
  };

  const formatTimeForDisplay = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(2)} seconds`;
    } else if (seconds < 3600) {
      return `${(seconds / 60).toFixed(2)} minutes`;
    } else if (seconds < 86400) {
      return `${(seconds / 3600).toFixed(2)} hours`;
    } else if (seconds < 2592000) {
      return `${(seconds / 86400).toFixed(2)} days`;
    } else if (seconds < 31536000) {
      return `${(seconds / 2592000).toFixed(2)} months`;
    } else {
      return `${(seconds / 31536000).toFixed(2)} years`;
    }
  };

  const getAttackIcon = (method: string) => {
    if (method.includes("Online")) {
      return <Shield className="mr-2 h-4 w-4" />;
    } else if (method.includes("GPU")) {
      return <Gpu className="mr-2 h-4 w-4" />;
    } else if (method.includes("trillion")) {
      return <Server className="mr-2 h-4 w-4" />;
    } else {
      return <Cpu className="mr-2 h-4 w-4" />;
    }
  };

  const prepareChartData = () => {
    return Object.entries(crackTimes).map(([method, time]) => {
      const seconds = parseTimeToSeconds(time);
      let logValue = seconds > 0 ? Math.log10(seconds) : 0;
      // Cap at 20 for visualization purposes (represents 10^20 seconds or ~3.17 trillion years)
      logValue = Math.min(logValue, 20);
      
      return {
        name: method,
        value: logValue,
        originalTime: time,
        seconds: seconds
      };
    });
  };

  const chartData = prepareChartData();

  const getBarColor = (value: number) => {
    if (value < 3) return "#ef4444"; // Less than 1000 seconds (red)
    if (value < 6) return "#f97316"; // Less than 10^6 seconds (orange)
    if (value < 8) return "#eab308"; // Less than 10^8 seconds (yellow)
    return "#22c55e"; // Greater than 10^8 seconds (green)
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2" size={18} />
          Password Cracking Simulation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" onValueChange={(value) => setActiveView(value as "basic" | "advanced")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="basic">Basic View</TabsTrigger>
            <TabsTrigger value="advanced">Advanced View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic">
            <ul className="space-y-3">
              {Object.entries(crackTimes).map(([method, time]) => (
                <li key={method} className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex items-center">
                    {getAttackIcon(method)}
                    <span className="text-sm text-muted-foreground">{method}</span>
                  </div>
                  <span className={`font-mono font-bold ${getTimeColor(time)}`}>{time}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="py-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.15} />
                  <XAxis 
                    dataKey="name" 
                    fontSize={10}
                    tickFormatter={(value) => value.replace(/ \([^)]*\)/g, '')}
                  />
                  <YAxis 
                    tickFormatter={(value) => `10^${Math.round(value)}`}
                    fontSize={10}
                    label={{ value: 'Time (log scale)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [props.payload.originalTime, 'Time to crack']}
                    labelFormatter={(value) => `Attack method: ${value}`}
                  />
                  <Bar dataKey="value" fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p className="mb-2 font-medium">Understanding the simulation:</p>
                <ul className="space-y-1 list-disc pl-5">
                  <li>The chart shows estimated crack times on a logarithmic scale (10^x seconds)</li>
                  <li>Red bars indicate quick cracks (minutes/hours)</li>
                  <li>Green bars indicate strong passwords (years/centuries)</li>
                  <li>Modern GPUs can test billions of combinations per second</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Custom Gpu icon since it's not in lucide-react
const Gpu = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <line x1="12" y1="6" x2="12" y2="18" />
    <path d="M8 6v-2" />
    <path d="M16 6v-2" />
    <path d="M8 18v2" />
    <path d="M16 18v2" />
  </svg>
);

export default CrackTimeCard;
