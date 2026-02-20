import { Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-0 shadow-soft-md">
          <CardContent className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive/70" />
            <p className="text-sm font-medium text-muted-foreground">
              {this.props.fallbackTitle || "Gagal memuat komponen"}
            </p>
            <Button variant="outline" size="sm" onClick={this.handleRetry} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
