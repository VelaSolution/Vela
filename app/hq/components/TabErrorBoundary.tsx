"use client";
import React from "react";

interface Props { children: React.ReactNode; tabName?: string; }
interface State { hasError: boolean; error?: Error; }

export default class TabErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[HQ Tab Error - ${this.props.tabName}]`, error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-sm font-semibold text-slate-700">{this.props.tabName ?? "탭"} 로딩 중 오류가 발생했습니다</p>
          <p className="text-xs text-slate-400 max-w-sm text-center">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="rounded-xl bg-[#3182F6] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#2672DE] transition active:scale-[0.97]"
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
