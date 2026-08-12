package com.example

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.addCallback
import androidx.activity.enableEdgeToEdge
import androidx.webkit.WebViewAssetLoader

/**
 * HabitFlow is built as a React/Vite web app. Rather than reimplementing the
 * whole UI natively, this Activity hosts that web build inside a WebView.
 * The production web bundle is copied into app/src/main/assets/www by the
 * CI workflow (npm run build -> dist -> assets/www) before Gradle runs.
 */
class MainActivity : ComponentActivity() {

  @SuppressLint("SetJavaScriptEnabled")
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    val assetLoader = WebViewAssetLoader.Builder()
      .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
      .build()

    val webView = WebView(this)
    setContentView(webView)

    webView.settings.javaScriptEnabled = true
    webView.settings.domStorageEnabled = true
    webView.settings.allowFileAccess = false
    webView.settings.allowContentAccess = false

    webView.webViewClient = object : WebViewClient() {
      override fun shouldInterceptRequest(
        view: WebView,
        request: WebResourceRequest
      ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)
    }

    webView.loadUrl("https://appassets.androidplatform.net/assets/www/index.html")

    onBackPressedDispatcher.addCallback(this) {
      if (webView.canGoBack()) webView.goBack() else finish()
    }
  }
}
