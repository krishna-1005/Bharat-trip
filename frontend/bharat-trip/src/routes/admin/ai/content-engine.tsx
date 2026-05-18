import { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import api from "@/lib/api";
import { 
  Cpu,
  Sparkles,
  Zap,
  Copy,
  RotateCcw,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Layout,
  TrendingUp,
  History,
  ChevronRight,
  Hash,
  Share2,
  Heart,
  Type,
  Loader2,
  CheckCircle2,
  XCircle,
  Calendar,
  Download,
  Flame,
  Clapperboard,
  Image as ImageIcon,
  ScrollText,
  Clock,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminAiContentEnginePage() {
  return (
    <AdminProtectedRoute>
      <AdminShell>
        <ContentEngine />
      </AdminShell>
    </AdminProtectedRoute>
  );
}

const PLATFORMS = [
  { id: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "YouTube Shorts", icon: Youtube, color: "text-red-500" },
  { id: "Twitter/X", icon: Twitter, color: "text-sky-500" },
  { id: "LinkedIn", icon: Linkedin, color: "text-blue-600" }
];

const CONTENT_TYPES = ["Reel", "Carousel", "Story", "Tweet", "Ad Creative"];
const TONES = ["Viral", "Luxury", "Emotional", "Adventure", "Minimal"];
const DURATIONS = ["15 sec", "30 sec", "60 sec"];

const MOCK_TRENDS = [
  "Hidden Bali Cafes",
  "Budget Dubai Luxury",
  "Thailand Under ₹30k",
  "Secret Goa Spots"
];

function ContentEngine() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [contentType, setContentType] = useState("Reel");
  const [tone, setTone] = useState("Viral");
  const [duration, setDuration] = useState("30 sec");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("hooks");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/ai/content-engine");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic to generate content");
      return;
    }

    setIsGenerating(true);
    setCurrentContent(null);
    
    try {
      const res = await api.post("/ai/content-engine", {
        topic,
        platform,
        contentType,
        tone,
        videoDuration: duration
      });

      if (res.data.success) {
        setCurrentContent(res.data.data);
        setHistory([res.data.data, ...history]);
        toast.success("Viral content generated!");
        setActiveTab("hooks");
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      toast.error(err.response?.data?.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch(`/ai/content-engine/${id}`, { status });
      if (res.data.success) {
        toast.success(`Content ${status.toLowerCase()}!`);
        if (currentContent?._id === id) {
          setCurrentContent(res.data.data);
        }
        setHistory(history.map(item => item._id === id ? res.data.data : item));
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteContent = async (id: string) => {
    try {
      await api.delete(`/ai/content-engine/${id}`);
      toast.success("Content deleted");
      if (currentContent?._id === id) setCurrentContent(null);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      toast.error("Failed to delete content");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const PlatformIcon = PLATFORMS.find(p => p.id === platform)?.icon || Cpu;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center">
              <Cpu className="size-6" />
            </div>
            AI Content Engine
          </h1>
          <p className="text-muted-foreground mt-1">Generate viral travel content across platforms with elite AI.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="px-3 py-1 gap-2 border-indigo-500/30 bg-indigo-500/5 text-indigo-500 h-9">
              <Flame className="size-3.5 fill-current" />
              Viral Mode Active
           </Badge>
           <Button variant="outline" className="rounded-xl gap-2 h-11 border-border bg-card shadow-sm">
             <Calendar className="size-4" /> Schedule Queue
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 flex-1 min-h-0">
        {/* Left Panel: Configuration */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto custom-scrollbar pr-1">
          <Card className="rounded-[2rem] border-border bg-card shadow-xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Type className="size-4 text-indigo-500" />
                Content Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Main Topic / Idea</label>
                <Textarea 
                  placeholder="e.g. Hidden beaches in Gokarna, Luxury stay in Udaipur for cheap..."
                  className="min-h-[100px] rounded-2xl bg-secondary/20 border-border focus:ring-indigo-500 transition-all resize-none text-sm font-medium"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Platform</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-2 ${
                          platform === p.id 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500 shadow-sm" 
                          : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <p.icon className={`size-3.5 ${platform === p.id ? "text-indigo-500" : p.color}`} />
                        {p.id}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Type</label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vibe/Tone</label>
                    <Select value={tone} onValueChange={setTone}>
                      <SelectTrigger className="rounded-xl bg-secondary/30 border-transparent h-10 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TONES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Video Duration</label>
                  <div className="flex gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          duration === d 
                          ? "bg-indigo-500/10 border-indigo-500 text-indigo-500" 
                          : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button 
                onClick={handleGenerate} 
                className="w-full rounded-2xl h-12 text-base font-bold shadow-lg shadow-indigo-500/20 gap-2 bg-indigo-600 hover:bg-indigo-500 transition-all active:scale-95"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Calculating Virality...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Generate Viral Kit
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-[2rem] border-border bg-card shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-500" />
                Trending Now
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex flex-wrap gap-2">
                {MOCK_TRENDS.map(t => (
                  <button 
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-3 py-1.5 rounded-full bg-secondary/40 text-[10px] font-bold hover:bg-indigo-500/10 hover:text-indigo-500 transition-all border border-transparent hover:border-indigo-500/20"
                  >
                    #{t.replace(/\s+/g, '')}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
             <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                <History className="size-4 text-indigo-500" />
                History
             </h4>
             <ScrollArea className="flex-1 -mx-2 px-2">
               <div className="space-y-3 pb-4">
                  {history.length > 0 ? history.map((h) => (
                     <div 
                      key={h._id} 
                      className={`group p-3 rounded-2xl bg-secondary/20 hover:bg-indigo-500/5 transition-all cursor-pointer border-l-4 ${
                        h.status === 'Approved' ? 'border-emerald-500' : 
                        h.status === 'Rejected' ? 'border-rose-500' : 'border-indigo-500/30'
                      }`}
                      onClick={() => setCurrentContent(h)}
                     >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-indigo-500">{h.platform} • {h.contentType}</span>
                          <span className="text-[9px] text-muted-foreground font-medium">{new Date(h.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs font-bold truncate pr-6">{h.topic}</p>
                        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="flex gap-2">
                              {h.status === 'Pending' && (
                                <>
                                  <button onClick={(e) => { e.stopPropagation(); updateStatus(h._id, 'Approved'); }} className="size-5 rounded-md bg-emerald-500/10 text-emerald-500 grid place-items-center hover:bg-emerald-500 hover:text-white transition-colors">
                                    <CheckCircle2 className="size-3" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); updateStatus(h._id, 'Rejected'); }} className="size-5 rounded-md bg-rose-500/10 text-rose-500 grid place-items-center hover:bg-rose-500 hover:text-white transition-colors">
                                    <XCircle className="size-3" />
                                  </button>
                                </>
                              )}
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); deleteContent(h._id); }} className="size-5 rounded-md bg-secondary/50 text-muted-foreground grid place-items-center hover:bg-rose-500 hover:text-white transition-colors">
                              <Trash2 className="size-3" />
                           </button>
                        </div>
                     </div>
                  )) : (
                    <div className="text-center py-10 opacity-40">
                      <Clock className="size-10 mx-auto mb-2" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No history yet</p>
                    </div>
                  )}
               </div>
             </ScrollArea>
          </div>
        </div>

        {/* Right Panel: Content Display */}
        <div className="flex flex-col h-full min-h-0 bg-secondary/5 rounded-[2.5rem] border border-border/50 overflow-hidden shadow-inner">
          {currentContent ? (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              {/* Top Banner */}
              <div className="p-6 bg-card border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 grid place-items-center shadow-inner">
                    {(() => {
                      const platformData = PLATFORMS.find(p => p.id === currentContent.platform);
                      const Icon = platformData?.icon || Cpu;
                      return <Icon className="size-6" />;
                    })()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-display font-bold tracking-tight">{currentContent.topic}</h2>
                      <Badge className={`${
                        currentContent.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        currentContent.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                        'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
                      } px-2 py-0 text-[10px] font-bold`}>
                        {currentContent.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Layout className="size-3" /> {currentContent.contentType}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        <Sparkles className="size-3" /> {currentContent.tone} Tone
                      </span>
                      {currentContent.videoDuration && (
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Clock className="size-3" /> {currentContent.videoDuration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-secondary/20 p-3 rounded-2xl border border-border/50">
                  <div className="text-center px-4 border-r border-border/50">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Virality</p>
                    <p className="text-2xl font-display font-black text-indigo-500 leading-none">{currentContent.generatedOutput.viralityScore}%</p>
                  </div>
                  <div className="max-w-[150px]">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">AI Prediction</p>
                    <p className="text-[10px] font-medium leading-tight text-foreground/80">{currentContent.generatedOutput.engagementPrediction}</p>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-4 border-b border-border bg-card/50">
                  <TabsList className="bg-secondary/30 p-1 rounded-xl h-12 w-full justify-start overflow-x-auto no-scrollbar">
                    <TabsTrigger value="hooks" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <Zap className="size-3.5 text-amber-500" />
                      <span className="text-xs font-bold">Viral Hooks</span>
                    </TabsTrigger>
                    <TabsTrigger value="script" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <Clapperboard className="size-3.5 text-indigo-500" />
                      <span className="text-xs font-bold">Reel Script</span>
                    </TabsTrigger>
                    <TabsTrigger value="storyboard" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <ImageIcon className="size-3.5 text-rose-500" />
                      <span className="text-xs font-bold">Storyboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="caption" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <ScrollText className="size-3.5 text-emerald-500" />
                      <span className="text-xs font-bold">Caption</span>
                    </TabsTrigger>
                    <TabsTrigger value="hashtags" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <Hash className="size-3.5 text-sky-500" />
                      <span className="text-xs font-bold">Hashtags</span>
                    </TabsTrigger>
                    <TabsTrigger value="thumbnail" className="rounded-lg gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm px-4">
                      <ImageIcon className="size-3.5 text-pink-500" />
                      <span className="text-xs font-bold">Thumbnail</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    <TabsContent value="hooks" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {currentContent.generatedOutput.hooks.map((hook: string, i: number) => (
                        <div key={i} className="group relative p-6 rounded-3xl border border-border bg-card shadow-sm hover:border-indigo-500/30 transition-all">
                           <div className="absolute top-4 right-4 flex gap-2">
                             <Button variant="ghost" size="icon" className="size-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(hook)}>
                               <Copy className="size-3.5" />
                             </Button>
                           </div>
                           <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-2 block">Option 0{i+1}</label>
                           <p className="text-lg font-display font-bold leading-tight italic">"{hook}"</p>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="script" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-secondary/20 border-b border-border">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground w-20">Scene</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Visual Description</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Audio / VO</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentContent.generatedOutput.reelScript.map((scene: any) => (
                                <tr key={scene.scene} className="border-b border-border/50 hover:bg-secondary/5 transition-colors">
                                  <td className="px-6 py-5 align-top">
                                    <div className="size-8 rounded-lg bg-indigo-500/10 text-indigo-500 grid place-items-center font-black text-xs">
                                      {scene.scene}
                                    </div>
                                  </td>
                                  <td className="px-6 py-5 text-sm font-medium leading-relaxed">{scene.visual}</td>
                                  <td className="px-6 py-5 text-sm font-bold text-indigo-500 italic leading-relaxed">"{scene.audio}"</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                       </div>
                    </TabsContent>

                    <TabsContent value="storyboard" className="mt-0 grid md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {currentContent.generatedOutput.storyboard.map((shot: any) => (
                         <div key={shot.shot} className="p-6 rounded-3xl border border-border bg-card shadow-sm flex gap-4 items-start">
                            <div className="size-10 shrink-0 rounded-2xl bg-secondary/50 border border-border grid place-items-center text-xs font-black">
                              S{shot.shot}
                            </div>
                            <div>
                               <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Visual Direction</label>
                               <p className="text-sm font-medium leading-relaxed">{shot.description}</p>
                            </div>
                         </div>
                       ))}
                    </TabsContent>

                    <TabsContent value="caption" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="group relative p-8 rounded-3xl border border-border bg-card shadow-sm">
                          <div className="absolute top-6 right-6 flex gap-2">
                             <Button variant="outline" className="rounded-xl gap-2 h-10 border-border bg-secondary/20 font-bold" onClick={() => copyToClipboard(currentContent.generatedOutput.caption)}>
                               <Copy className="size-4" /> Copy Caption
                             </Button>
                          </div>
                          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4 block">Instagram / Platform Ready Caption</label>
                          <div className="whitespace-pre-wrap text-base leading-relaxed text-foreground font-medium">
                            {currentContent.generatedOutput.caption}
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="hashtags" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="p-8 rounded-3xl border border-border bg-card shadow-sm">
                          <label className="text-[10px] font-bold text-sky-500 uppercase tracking-widest mb-6 block">Optimized Hashtags</label>
                          <div className="flex flex-wrap gap-3">
                             {currentContent.generatedOutput.hashtags.map((h: string) => (
                               <Badge key={h} variant="secondary" className="px-4 py-2 rounded-xl text-xs font-bold hover:bg-sky-500/10 hover:text-sky-500 cursor-pointer transition-all border-transparent hover:border-sky-500/20">
                                 #{h.replace('#', '')}
                               </Badge>
                             ))}
                          </div>
                          <Button variant="ghost" size="sm" className="mt-8 gap-2 font-bold text-muted-foreground" onClick={() => copyToClipboard(currentContent.generatedOutput.hashtags.map((h: string) => "#"+h.replace('#', '')).join(" "))}>
                             <Copy className="size-3.5" /> Copy All Hashtags
                          </Button>
                       </div>
                    </TabsContent>

                    <TabsContent value="thumbnail" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                       <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
                          <div className="aspect-video bg-secondary/30 flex items-center justify-center border-b border-border group overflow-hidden">
                             <div className="text-center p-10 group-hover:scale-105 transition-transform duration-700">
                                <ImageIcon className="size-16 mx-auto mb-4 text-pink-500 opacity-20" />
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">Visual Concept Visualization</p>
                             </div>
                          </div>
                          <div className="p-8">
                             <label className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-2 block">Thumbnail Concept</label>
                             <p className="text-lg font-display font-bold leading-tight">{currentContent.generatedOutput.thumbnailConcept}</p>
                             <div className="mt-6 p-4 rounded-2xl bg-secondary/20 border border-border/50">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Designer Note:</p>
                                <p className="text-xs font-medium leading-relaxed italic opacity-80">
                                   "Use high-contrast text overlays with GoTripo's brand font. Ensure the background image is color-graded for warmth and luxury."
                                </p>
                             </div>
                          </div>
                       </div>
                    </TabsContent>
                  </div>
                </div>
              </Tabs>

              {/* Bottom Action Bar */}
              <div className="p-6 bg-card border-t border-border flex flex-wrap items-center justify-between gap-4">
                 <div className="flex items-center gap-2">
                    {currentContent.status === 'Pending' && (
                      <>
                        <Button 
                          onClick={() => updateStatus(currentContent._id, 'Approved')}
                          className="rounded-2xl h-12 px-6 gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 font-bold"
                        >
                          <CheckCircle2 className="size-5" /> Approve Content
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => updateStatus(currentContent._id, 'Rejected')}
                          className="rounded-2xl h-12 px-6 gap-2 text-rose-500 hover:bg-rose-500/10 font-bold"
                        >
                          <XCircle className="size-5" /> Reject
                        </Button>
                      </>
                    )}
                    {currentContent.status === 'Approved' && (
                      <Badge className="h-12 px-6 rounded-2xl bg-emerald-500 text-white font-black text-sm gap-2">
                        <CheckCircle2 className="size-5" /> APPROVED FOR POSTING
                      </Badge>
                    )}
                    {currentContent.status === 'Rejected' && (
                      <Badge className="h-12 px-6 rounded-2xl bg-rose-500 text-white font-black text-sm gap-2">
                        <XCircle className="size-5" /> REJECTED
                      </Badge>
                    )}
                 </div>

                 <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl h-12 px-5 gap-2 border-border font-bold hover:bg-secondary" onClick={handleGenerate} disabled={isGenerating}>
                       <RotateCcw className={`size-4 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-12 px-5 gap-2 border-border font-bold hover:bg-secondary">
                       <Download className="size-4" /> Export Assets
                    </Button>
                    <Button className="rounded-2xl h-12 px-8 gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 font-black tracking-tight">
                       SCHEDULE POST <ChevronRight className="size-4" />
                    </Button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-700">
               <div className="size-32 rounded-full bg-indigo-500/5 grid place-items-center mb-6 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500/40 animate-spin" />
                  <Cpu className="size-16 text-indigo-500 opacity-20" />
               </div>
               <h3 className="text-2xl font-display font-bold tracking-tight mb-2">Ready to Go Viral?</h3>
               <p className="text-muted-foreground max-w-sm mb-8 text-sm font-medium">
                  Select your platform and topic on the left to generate a complete viral content kit with hooks, scripts, and captions.
               </p>
               <div className="flex gap-3">
                  <Badge variant="outline" className="px-4 py-2 rounded-full border-border bg-card/50 text-[10px] font-bold">
                    <Zap className="size-3 text-amber-500 mr-2" /> AI Optimized
                  </Badge>
                  <Badge variant="outline" className="px-4 py-2 rounded-full border-border bg-card/50 text-[10px] font-bold">
                    <Flame className="size-3 text-rose-500 mr-2" /> Trending Logic
                  </Badge>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
