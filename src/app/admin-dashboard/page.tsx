
'use client';

import * as React from 'react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute';
import { useFirestore, useCollection, useAuth, useMemoFirebase } from '@/firebase';
import { collection, query, deleteDoc, doc, updateDoc, limit, orderBy } from 'firebase/firestore';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Trash2, 
  LogOut, 
  Users, 
  FileText, 
  Flag,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/ProductCard";

export default function AdminDashboardPage() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const reportsRef = useMemoFirebase(() => collection(db, "reports"), [db]);
  const reportsQuery = useMemoFirebase(() => query(reportsRef, limit(100)), [reportsRef]);
  const { data: rawReports, isLoading: reportsLoading } = useCollection(reportsQuery);

  const postsRef = useMemoFirebase(() => collection(db, "posts"), [db]);
  const postsQuery = useMemoFirebase(() => query(postsRef, limit(100)), [postsRef]);
  const { data: rawPosts, isLoading: postsLoading } = useCollection(postsQuery);

  const articlesRef = useMemoFirebase(() => collection(db, "articles"), [db]);
  const articlesQuery = useMemoFirebase(() => query(articlesRef, limit(100)), [articlesRef]);
  const { data: articles, isLoading: articlesLoading } = useCollection(articlesQuery);

  const usersRef = useMemoFirebase(() => collection(db, "users"), [db]);
  const usersQuery = useMemoFirebase(() => query(usersRef, limit(100)), [usersRef]);
  const { data: users, isLoading: usersLoading } = useCollection(usersQuery);

  const productsRef = useMemoFirebase(() => collection(db, "products"), [db]);
  const productsQuery = useMemoFirebase(() => query(productsRef, orderBy("dateAdded", "desc"), limit(100)), [productsRef]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const pendingProducts = React.useMemo(() => {
    if (!products) return [];
    return products.filter(p => !p.isVerified);
  }, [products]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin-login');
  };

  const handleDeleteContent = (type: "posts" | "articles", id: string) => {
    deleteDoc(doc(db, type, id)).then(() => {
      toast({ title: "Content Purged", description: "Removed from system inventory." });
    });
  };

  const handleApproveProduct = (productId: string) => {
    updateDoc(doc(db, "products", productId), { 
      isVerified: true,
      adminNotes: "Approved for GoodKart Verification based on community audit depth."
    }).then(() => {
      toast({ title: "Verification Granted", description: "Product promoted to GoodKart Verified." });
    });
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-body">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Link href="/" className="bg-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-widest leading-none">Moderation Hub</h1>
            </div>
            <Button variant="destructive" className="gap-2 rounded-2xl h-12 px-6 font-bold" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Log Out
            </Button>
          </div>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="bg-white border p-1 rounded-2xl mb-8 w-fit shadow-sm overflow-x-auto">
              <TabsTrigger value="products" className="rounded-xl gap-2 px-8 h-10">
                <ShoppingBag className="w-4 h-4" />
                <span className="font-bold">GoodKart Queue</span>
              </TabsTrigger>
              <TabsTrigger value="articles" className="rounded-xl gap-2 px-8 h-10">
                <BookOpen className="w-4 h-4" />
                <span className="font-bold">Knowledge Hub</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-xl gap-2 px-8 h-10">
                <Flag className="w-4 h-4" />
                <span className="font-bold">Active Reports</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-xl gap-2 px-8 h-10">
                <Users className="w-4 h-4" />
                <span className="font-bold">User Directory</span>
              </TabsTrigger>
              <TabsTrigger value="posts" className="rounded-xl gap-2 px-8 h-10">
                <FileText className="w-4 h-4" />
                <span className="font-bold">Feed Posts</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
                <CardHeader className="border-b p-10">
                  <CardTitle className="text-2xl font-black uppercase tracking-widest text-primary">GoodKart Verification Queue</CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  {productsLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-300 w-12 h-12" /></div>
                  ) : pendingProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pendingProducts.map(product => (
                        <div key={product.id} className="space-y-4">
                          <ProductCard product={product} />
                          <div className="flex gap-2">
                            <Button className="flex-1 rounded-xl h-12 bg-primary font-black uppercase tracking-widest text-[9px] gap-2" onClick={() => handleApproveProduct(product.id)}>
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                            <Button variant="outline" className="flex-1 rounded-xl h-12 border-red-100 text-red-500 hover:bg-red-50 font-black uppercase tracking-widest text-[9px] gap-2" onClick={() => deleteDoc(doc(db, "products", product.id))}>
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32"><ShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-4" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">Review queue is clear.</p></div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="articles">
              <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
                <CardHeader className="border-b p-10"><CardTitle className="text-2xl font-black uppercase tracking-widest text-primary">Knowledge Hub Moderation</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {articlesLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-300 w-12 h-12" /></div>
                  ) : articles ? (
                    <Table>
                      <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-10">Article Title</TableHead><TableHead>Category</TableHead><TableHead className="text-center">Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {articles.map((article: any) => (
                          <TableRow key={article.id} className="border-slate-100"><TableCell className="pl-10 py-6 font-bold">{article.title}</TableCell><TableCell><Badge variant="outline" className="text-[9px] uppercase font-bold">{article.category}</Badge></TableCell><TableCell className="text-center"><Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => handleDeleteContent("articles", article.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
                <CardHeader className="border-b p-10"><CardTitle className="text-2xl font-black uppercase tracking-widest text-primary">Security Flags</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {reportsLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-300 w-12 h-12" /></div>
                  ) : rawReports && rawReports.length > 0 ? (
                    <Table>
                      <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-10">Target Item</TableHead><TableHead>Violation Reason</TableHead><TableHead className="text-center">Protocol</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {rawReports.map((report: any) => (
                          <TableRow key={report.id} className="border-slate-100"><TableCell className="pl-10 py-6 font-bold">{report.postTitle}</TableCell><TableCell><Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest">{report.reason}</Badge></TableCell><TableCell className="text-center"><Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-100" onClick={() => deleteDoc(doc(db, "reports", report.id))}><Trash2 className="w-3.5 h-3.5 mr-2" />Dismiss Report</Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-32"><Flag className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-muted-foreground font-medium italic">No security flags detected.</p></div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
               <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
                <CardHeader className="border-b p-10"><CardTitle className="text-2xl font-black uppercase tracking-widest text-primary">User Directory</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {usersLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-300 w-12 h-12" /></div>
                  ) : users ? (
                    <Table>
                      <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-10">Identity</TableHead><TableHead>Access</TableHead><TableHead className="text-center">Protocol</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {users.map((user: any) => (
                          <TableRow key={user.id} className="border-slate-100"><TableCell className="pl-10 py-6"><div className="flex items-center gap-4"><Avatar className="h-10 w-10"><AvatarImage src={user.photoURL} /><AvatarFallback className="bg-slate-200">{user.displayName?.[0] || 'U'}</AvatarFallback></Avatar><div><p className="font-bold text-slate-900 text-sm">{user.displayName || 'Anonymous'}</p><p className="text-[10px] text-muted-foreground">{user.email}</p></div></div></TableCell><TableCell><Badge variant={user.isAdmin ? "default" : "outline"} className="text-[9px] uppercase">{user.isAdmin ? "Admin" : "Member"}</Badge></TableCell><TableCell className="text-center"><Button variant="outline" size="sm" className="text-red-500 border-red-100" onClick={() => updateDoc(doc(db, "users", user.id), { isBanned: true })} disabled={user.isAdmin}>Suspend</Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts">
              <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem] bg-white">
                <CardHeader className="border-b p-10"><CardTitle className="text-2xl font-black uppercase tracking-widest text-primary">Feed Content</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {postsLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-slate-300 w-12 h-12" /></div>
                  ) : rawPosts ? (
                    <Table>
                      <TableHeader className="bg-slate-50/50"><TableRow><TableHead className="pl-10">Title</TableHead><TableHead>Category</TableHead><TableHead className="text-center">Action</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {rawPosts.map((post: any) => (
                          <TableRow key={post.id} className="border-slate-100"><TableCell className="pl-10 py-6 font-bold">{post.title}</TableCell><TableCell><Badge variant="outline" className="text-[9px] uppercase font-bold">{post.category}</Badge></TableCell><TableCell className="text-center"><Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-50" onClick={() => handleDeleteContent("posts", post.id)}><Trash2 className="w-4 h-4" /></Button></TableCell></TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
