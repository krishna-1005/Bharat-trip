import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { AdminShell } from "@/components/AdminShell";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  MessageSquare, 
  Search, 
  Star, 
  Trash2,
  Loader2,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Quote
  } from "lucide-react";
  import { Skeleton } from "@/components/ui/skeleton";
  import { toast } from "sonner";
export default function AdminReviewsPage() {
  return (
    <AdminProtectedRoute>
      <AdminReviews />
    </AdminProtectedRoute>
  );
}

function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("Reviews fetch error:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = reviews.filter(r => 
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <AdminShell>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-64 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-3xl border border-border p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-12 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-xl" />
                <div className="pt-4 border-t border-border flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Review Moderation</h1>
            <p className="text-muted-foreground mt-1">Manage and moderate user feedback and testimonials.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-[300px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.length > 0 ? filteredReviews.map((review) => (
            <div key={review._id} className="rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition group relative">
              <button 
                onClick={() => deleteReview(review._id)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition shadow-sm"
              >
                <Trash2 className="size-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-secondary grid place-items-center flex-shrink-0">
                  <Quote className="size-6 text-primary/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">{review.userName}</h3>
                    <div className="flex items-center gap-0.5 text-orange-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`size-3.5 ${i < review.rating ? "fill-current" : "text-muted"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="size-3" />
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.userEmail && (
                       <>
                         <span className="mx-1">•</span>
                         <span className="text-primary font-medium">{review.userEmail}</span>
                       </>
                    )}
                  </div>
                  
                  <div className="mt-4 text-sm leading-relaxed text-foreground/80 italic">
                    "{review.comment}"
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-[10px]">
                        {review.userName?.[0] || "R"}
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">User Review</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">
                       <CheckCircle2 className="size-3" />
                       Verified
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center rounded-3xl border border-dashed border-border bg-secondary/20">
              <MessageSquare className="size-10 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground italic">No reviews match your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
