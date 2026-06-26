package com.faithstream.app;

import com.getcapacitor.BridgeActivity;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    private WebView webView;

    @Override
    public void onStart() {
        super.onStart();
        if (webView == null && getBridge() != null) {
            webView = getBridge().getWebView();
        }
        // Ensure media playback doesn't require user gesture after initial play
        if (webView != null) {
            webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Keep WebView timers running so audio continues in background
        if (webView != null) {
            webView.resumeTimers();
        }
    }
}
