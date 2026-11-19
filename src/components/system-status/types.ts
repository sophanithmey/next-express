export type SystemStatusVariant =
  | 'maintenance'
  | '500'
  | '503'
  | '404'
  | 'network'
  | 'general';

export interface SystemStatusProps {
  /** The error / maintenance variant to display */
  variant: SystemStatusVariant;
  /** Custom eyebrow overriding default */
  eyebrow?: string;
  /** Custom title overriding default */
  title?: string;
  /** Custom description message */
  description?: string;
  /** Optional error digest or reference ID */
  errorId?: string;
  /** Optional estimated completion ISO or human date */
  estimatedCompletion?: string;
  /** Optional custom notice or announcement banner */
  customNotice?: string;
  /** Callback when user clicks 'Try Again' or 'Check Again' */
  onRetry?: () => void | Promise<void>;
  /** Optional custom primary action href (defaults to '/') */
  primaryActionHref?: string;
  /** Whether retry is currently in progress */
  isRetrying?: boolean;
  /** Whether to show support contacts (default true for maintenance, 500, 503) */
  showSupport?: boolean;
}
