import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ArrowRight,
  Bot,
  Webhook,
  GitFork,
  Mail,
  Table,
  Terminal,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PlayCircle,
  Cpu,
  Layers,
  FileCheck
} from 'lucide-react';
import VisualFlowchart from '../components/workflow/VisualFlowchart';
import SamplePrompts from '../components/simulator/SamplePrompts';
import JsonViewer from '../components/execution/JsonViewer';
import Badge from '../components/common/Badge';
import api from '../services/api';

const LandingPage = () => {
  const [demoInput, setDemoInput] = useState('Customer Rahul has not received his order for 5 days. Please contact him and mark this as urgent.');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState(null);

  const runQuickDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await api.post('/webhook/request', {
        message: demoInput,
        source: 'landing_hero_demo'
      });
      setDemoResult(res.data);
    } catch (err) {
      console.error('Demo error:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const howItWorks = [
    {
      step: '01',
      title: '1. Receive',
      desc: 'Ingests raw incoming business messages via universal REST webhook endpoints or direct API payloads.',
      icon: Webhook,
      color: 'text-blue-400 bg-blue-950/40 border-blue-500/30'
    },
    {
      step: '02',
      title: '2. Understand',
      desc: 'OpenAI GPT extracts customer names, intent, priority urgency, sentiment, and structured JSON schemas.',
      icon: Bot,
      color: 'text-purple-400 bg-purple-950/40 border-purple-500/30'
    },
    {
      step: '03',
      title: '3. Decide',
      desc: 'Applies dynamic rule conditions (IF intent == lead THEN sheet, IF priority == high THEN urgent email).',
      icon: GitFork,
      color: 'text-amber-400 bg-amber-950/40 border-amber-500/30'
    },
    {
      step: '04',
      title: '4. Execute',
      desc: 'Automatically dispatches targeted actions to Gmail, Google Sheets, and n8n enterprise workflows.',
      icon: Mail,
      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
    },
    {
      step: '05',
      title: '5. Track',
      desc: 'Records micro-telemetry timelines, status audits, execution durations, and interactive analytics.',
      icon: Terminal,
      color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30'
    }
  ];

  const features = [
    {
      title: 'AI Request Understanding',
      desc: 'Converts chaotic, unstructured customer emails and messages into strict, validated JSON schemas.',
      icon: Sparkles
    },
    {
      title: 'Intelligent Conditional Routing',
      desc: 'Multi-branch switch router evaluating intent, sentiment, priority, and custom business metadata.',
      icon: GitFork
    },
    {
      title: 'Universal Webhook Automation',
      desc: 'Dedicated webhook listeners per workflow supporting standard JSON ingestion from websites, apps, and CRMs.',
      icon: Webhook
    },
    {
      title: 'Gmail & Email Automation',
      desc: 'Auto-generates contextual notifications and high-priority escalation alerts dispatched via SMTP or simulated.',
      icon: Mail
    },
    {
      title: 'Google Sheets CRM Sync',
      desc: 'Real-time database insertion capturing customer names, company names, lead intents, and summaries.',
      icon: Table
    },
    {
      title: 'n8n Workflow Integration',
      desc: 'Full compatibility with n8n orchestrations for complex multi-node enterprise pipelines.',
      icon: Layers
    },
    {
      title: 'Execution Monitoring & Timelines',
      desc: 'Sub-millisecond step telemetry capturing webhook receipt, AI latency, routing decisions, and results.',
      icon: Cpu
    },
    {
      title: 'Real-time Telemetry & Analytics',
      desc: 'Interactive visual metrics tracking intent distributions, failure rates, daily volumes, and platform health.',
      icon: BarChart3
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Background Blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-blue-600/20 blur-[120px] pointer-events-none -z-10" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation Intelligent Workflow Automation</span>
        </div>

        {/* Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Turn Business Requests Into <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Automated Actions
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            AI-powered workflow automation that understands incoming requests, routes them intelligently, and executes the right action automatically.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/simulator"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:scale-105 active:scale-95"
          >
            <PlayCircle className="w-4 h-4 text-indigo-400" />
            <span>View Live Demo</span>
          </Link>
        </div>

        {/* Visual Pipeline Component */}
        <div className="pt-10 max-w-5xl mx-auto">
          <VisualFlowchart />
        </div>
      </section>

      {/* Interactive Live Demo Widget */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                <PlayCircle className="w-4 h-4" />
                <span>Interactive Live Preview</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Test FlowPilot AI Engine in Real-Time</h2>
            </div>
            <Link
              to="/simulator"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Open Full Request Simulator →
            </Link>
          </div>

          {/* Quick Prompts */}
          <SamplePrompts onSelect={(text) => setDemoInput(text)} />

          {/* Input Box */}
          <div className="space-y-3">
            <textarea
              rows={3}
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              placeholder="Enter any customer message or business request..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex justify-end">
              <button
                onClick={runQuickDemo}
                disabled={demoLoading || !demoInput.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
              >
                {demoLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>Run FlowPilot AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Result Box */}
          {demoResult && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={demoResult.intent} size="md">
                    Intent: {demoResult.intent}
                  </Badge>
                  <Badge variant={demoResult.priority} size="md">
                    Priority: {demoResult.priority}
                  </Badge>
                  <Badge variant="success" size="md">
                    Target: {demoResult.action}
                  </Badge>
                </div>
                <span className="text-xs text-indigo-400 font-mono">
                  Latency: {demoResult.durationMs}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400 font-semibold uppercase text-[10px]">AI Analysis Summary</div>
                  <p className="text-slate-200 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    {demoResult.aiAnalysis?.summary}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Customer Name</span>
                      <span className="text-slate-200 font-medium">{demoResult.aiAnalysis?.customer_name}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Recommended Action</span>
                      <span className="text-indigo-300 font-medium capitalize">
                        {demoResult.aiAnalysis?.requested_action?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 font-semibold uppercase text-[10px] mb-2">Structured JSON Output</div>
                  <JsonViewer data={demoResult.aiAnalysis} maxHeight="max-h-44" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
            Architecture Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How FlowPilot AI Operates
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From inbound webhook triggers to multi-service routing and enterprise telemetry in under 400ms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {howItWorks.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 relative group hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-slate-800 group-hover:text-indigo-500/40 transition-colors font-mono">
                    {item.step}
                  </span>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
            Comprehensive Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything Built For Real-World Automation
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Production-ready full-stack automation platform without fake mocks or dead buttons.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 space-y-3 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {f.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900/90 border border-indigo-500/30 rounded-3xl p-10 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Automate Your Business Operations?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience complete automated workflows with OpenAI GPT intelligence, conditional routing, Gmail alerts, and Google Sheets synchronization.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl transition-all hover:scale-105"
            >
              Open Dashboard
            </Link>
            <Link
              to="/workflows/new"
              className="px-6 py-3 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/40 text-white font-bold text-sm transition-all hover:scale-105"
            >
              Create New Workflow
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
