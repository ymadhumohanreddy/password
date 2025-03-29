import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface CrackTimesProps {
  crackTimes: Record<string, string>;
}

const CrackTimeCard = ({ crackTimes }: CrackTimesProps) => {
  const getTimeColor = (time: string) => {
    if (time.includes("years") && !time.includes("0.")) {
      return "text-green-500";
    } else if (time.includes("months") || time.includes("days")) {
      return "text-yellow-500";
    } else {
      return "text-destructive";
    }
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2" size={18} />
          Estimated Cracking Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {Object.entries(crackTimes).map(([method, time]) => (
            <li key={method} className="flex justify-between items-center border-b border-border/40 pb-2">
              <span className="text-sm text-muted-foreground">{method}</span>
              <span className={`font-mono font-bold ${getTimeColor(time)}`}>{time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default CrackTimeCard;