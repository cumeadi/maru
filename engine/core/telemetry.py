import httpx
from datetime import datetime

class TelemetryAlerts:
    def __init__(self, slack_webhook_url: str = None):
        self.slack_webhook_url = slack_webhook_url

    def detect_drift(self, agent_name: str, current_score: float, baseline_score: float):
        """
        Detects drift against a rolling 7-day baseline and triggers a Slack webhook if threshold is crossed.
        """
        drop = baseline_score - current_score
        
        if drop > 30.0:
            severity = "EMERGENCY"
        elif drop > 15.0:
            severity = "CRITICAL"
        elif drop > 5.0:
            severity = "WARNING"
        else:
            return None
            
        alert_msg = f"[{severity}] Drift Detected for agent '{agent_name}'. Score dropped by {round(drop, 2)}% (Baseline: {baseline_score} -> Current: {current_score})"
        self.send_slack_alert(alert_msg)
        return alert_msg

    def send_slack_alert(self, message: str):
        if not self.slack_webhook_url:
            print(f"Telemetry Log [No Webhook Configured]: {message}")
            return
            
        try:
            httpx.post(self.slack_webhook_url, json={"text": message})
            print(f"Successfully routed alert to Slack: {message}")
        except Exception as e:
            print(f"Failed to send Slack alert: {e}")

telemetry_service = TelemetryAlerts()
