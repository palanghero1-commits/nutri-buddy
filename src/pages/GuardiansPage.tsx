import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, MapPin, Phone, Search, ShieldCheck, UsersRound } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Guardian = {
  id: number | string;
  name: string;
  email: string;
  residentAddress: string;
  contactNumber: string;
  residencyConfirmed: boolean;
  verificationStatus: "pending" | "approved" | "rejected" | string;
  createdAt: string;
  children: Array<{ id: string; name: string; status: string; ageDisplay: string }>;
};

const PAGE_SIZE = 8;

function statusClass(status: string) {
  if (status === "approved") return "bg-[#e8f8ef] text-[#2d8c5c]";
  if (status === "rejected") return "bg-[#fff0f0] text-[#c44b4b]";
  return "bg-[#fff8dd] text-[#a8790d]";
}

export default function GuardiansPage() {
  const { toast } = useToast();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadGuardians = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const result = await apiRequest<{ guardians: Guardian[] }>("/api/guardians");
      setGuardians(result.guardians);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load guardians.";
      setErrorMessage(message);
      toast({ title: "Unable to load guardians", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadGuardians();
  }, [loadGuardians]);

  const filteredGuardians = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return guardians;
    return guardians.filter((guardian) => [guardian.name, guardian.email, guardian.contactNumber, guardian.residentAddress, guardian.verificationStatus, ...guardian.children.map((child) => `${child.name} ${child.status}`)].join(" ").toLowerCase().includes(query));
  }, [guardians, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredGuardians.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageGuardians = filteredGuardians.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const updateSearch = (value: string) => {
    setSearchInput(value);
    setSearchTerm(value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] bg-[#e8f6fc] p-6 shadow-[0_10px_30px_rgba(68,116,177,0.08)] sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#3970a5]"><UsersRound className="h-3.5 w-3.5" /> Guardian management</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#142650] sm:text-4xl">Guardians</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#48658f] sm:text-base">Review registered guardian accounts and monitor their verification status.</p>
      </section>

      <section className="rounded-[22px] border border-[#e1eaf8] bg-white p-5 shadow-[0_8px_24px_rgba(68,116,177,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="text-lg font-bold text-[#142650]">Guardian Accounts</h2><p className="mt-1 text-sm text-[#7990b5]">{filteredGuardians.length} guardian{filteredGuardians.length === 1 ? "" : "s"} found</p></div>
          <form onSubmit={submitSearch} className="flex w-full gap-2 lg:max-w-xl">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#dce7f7] bg-[#f8fbff] px-3 py-2.5 text-sm text-[#7990b5]"><Search className="h-4 w-4 shrink-0" /><input value={searchInput} onChange={(event) => updateSearch(event.target.value)} placeholder="Search by name, email, address, or status" aria-label="Search guardians" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#9aacC7]" /></label>
            <button type="submit" className="rounded-xl bg-[#4387f4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#347be7]">Search</button>
            {searchTerm && <button type="button" onClick={clearSearch} className="rounded-xl border border-[#dce7f7] px-3 py-2.5 text-sm font-semibold text-[#58739d] hover:bg-[#f3f8ff]">Clear</button>}
          </form>
        </div>

        {isLoading ? <div className="mt-6 grid gap-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-[#f1f6fd]" />)}</div> : errorMessage ? <div className="mt-6 rounded-2xl border border-[#ffd0d0] bg-[#fff5f5] p-6 text-center"><p className="text-sm font-semibold text-[#b34d4d]">Unable to load guardian accounts.</p><button type="button" onClick={loadGuardians} className="mt-3 rounded-xl bg-[#4387f4] px-4 py-2 text-sm font-semibold text-white">Retry</button></div> : pageGuardians.length === 0 ? <div className="mt-6 rounded-2xl bg-[#f3f8ff] p-10 text-center"><UsersRound className="mx-auto h-9 w-9 text-[#8badde]" /><p className="mt-3 text-sm font-semibold text-[#142650]">No guardians found</p><p className="mt-1 text-sm text-[#7990b5]">Try another search or wait for a guardian registration.</p></div> : <div className="mt-6 space-y-3">{pageGuardians.map((guardian) => <article key={guardian.id} className="rounded-2xl border border-[#e5edf8] p-4 transition hover:border-[#bcd5f5] hover:bg-[#fbfdff]"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f1ff] text-sm font-bold text-[#347be7]">{guardian.name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</div><div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#142650]">{guardian.name}</h3><p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#7990b5]"><Mail className="h-3.5 w-3.5 shrink-0" />{guardian.email}</p></div></div><div className="grid gap-2 text-xs text-[#637b9f] sm:grid-cols-3 xl:min-w-[540px]"><p className="flex items-start gap-1.5"><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0" />{guardian.contactNumber || "No contact number"}</p><p className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{guardian.residentAddress || "No address"}</p><span className={`inline-flex h-fit w-fit items-center gap-1 rounded-full px-2.5 py-1 font-semibold capitalize ${statusClass(guardian.verificationStatus)}`}><ShieldCheck className="h-3.5 w-3.5" />{guardian.verificationStatus}</span></div></div><div className="mt-4 border-t border-[#edf2f8] pt-3"><p className="text-xs font-semibold uppercase tracking-wide text-[#7990b5]">Child Profiles ({guardian.children.length})</p>{guardian.children.length > 0 ? <div className="mt-2 flex flex-wrap gap-2">{guardian.children.map((child) => <span key={child.id} className="inline-flex items-center gap-2 rounded-full bg-[#f1f6fd] px-3 py-1.5 text-xs font-semibold text-[#4d6d9e]">{child.name}<span className="font-normal text-[#7d94b8]">· {child.status}</span></span>)}</div> : <p className="mt-2 text-xs text-[#9aacC7]">No child profiles linked to this guardian.</p>}</div></article>)}</div>}

        {!isLoading && !errorMessage && filteredGuardians.length > 0 && <div className="mt-6 flex flex-col gap-3 border-t border-[#edf2f8] pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#7990b5]">Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredGuardians.length)} of {filteredGuardians.length}</p><div className="flex items-center gap-2"><button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#dce7f7] px-3 py-2 text-xs font-semibold text-[#58739d] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Previous</button><span className="rounded-lg bg-[#eaf4ff] px-3 py-2 text-xs font-bold text-[#347be7]">Page {currentPage} of {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="inline-flex items-center gap-1 rounded-lg border border-[#dce7f7] px-3 py-2 text-xs font-semibold text-[#58739d] disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button></div></div>}
      </section>
    </div>
  );
}
