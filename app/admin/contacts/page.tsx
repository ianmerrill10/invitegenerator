"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  Globe,
  Instagram,
  Linkedin,
  Edit,
  Trash2,
  MessageSquare,
  User,
  Users,
  Tag,
} from "lucide-react";
import { VendorContact, VendorCategory, ContactStatus, PartnershipStatus, ContactSource } from "@/types";
import { VENDOR_CATEGORIES, CONTACT_STATUSES, PARTNERSHIP_STATUSES } from "@/lib/services/contacts-service";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<VendorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [partnershipFilter, setPartnershipFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOutreachDialog, setShowOutreachDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<VendorContact | null>(null);
  const [editingContact, setEditingContact] = useState<VendorContact | null>(null);

  // Form state for new contact
  const [formData, setFormData] = useState({
    company: "",
    contactName: "",
    title: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    tiktok: "",
    category: "venue" as VendorCategory,
    subcategory: "",
    location: { city: "", state: "", country: "USA" },
    source: "manual" as ContactSource,
    status: "new" as ContactStatus,
    tags: [] as string[],
    notes: "",
    partnershipStatus: "none" as PartnershipStatus,
  });

  // Outreach form state
  const [outreachData, setOutreachData] = useState({
    type: "email" as "email" | "phone" | "dm_instagram" | "dm_facebook" | "dm_linkedin" | "dm_tiktok" | "meeting" | "conference" | "other",
    subject: "",
    notes: "",
    outcome: "pending" as "pending" | "positive" | "negative" | "no_response",
    followUpDate: "",
  });

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (partnershipFilter !== "all") params.append("partnershipStatus", partnershipFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/admin/contacts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setContacts(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, partnershipFilter, searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async () => {
    try {
      const response = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setContacts([data.data, ...contacts]);
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to add contact:", error);
    }
  };

  const handleUpdateContact = async () => {
    if (!editingContact) return;

    try {
      const response = await fetch(`/api/admin/contacts/${editingContact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setContacts(contacts.map(c => c.id === editingContact.id ? data.data : c));
        setEditingContact(null);
        setShowAddDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        setContacts(contacts.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleAddOutreach = async () => {
    if (!selectedContact) return;

    try {
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outreachData),
      });
      const data = await response.json();

      if (data.success) {
        setContacts(contacts.map(c => c.id === selectedContact.id ? data.data : c));
        setShowOutreachDialog(false);
        setSelectedContact(null);
        setOutreachData({
          type: "email",
          subject: "",
          notes: "",
          outcome: "pending",
          followUpDate: "",
        });
      }
    } catch (error) {
      console.error("Failed to add outreach:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      company: "",
      contactName: "",
      title: "",
      email: "",
      phone: "",
      website: "",
      instagram: "",
      facebook: "",
      linkedin: "",
      tiktok: "",
      category: "venue",
      subcategory: "",
      location: { city: "", state: "", country: "USA" },
      source: "manual",
      status: "new",
      tags: [],
      notes: "",
      partnershipStatus: "none",
    });
  };

  const openEditDialog = (contact: VendorContact) => {
    setEditingContact(contact);
    setFormData({
      company: contact.company,
      contactName: contact.contactName,
      title: contact.title || "",
      email: contact.email,
      phone: contact.phone || "",
      website: contact.website || "",
      instagram: contact.instagram || "",
      facebook: contact.facebook || "",
      linkedin: contact.linkedin || "",
      tiktok: contact.tiktok || "",
      category: contact.category,
      subcategory: contact.subcategory || "",
      location: {
        city: contact.location.city || "",
        state: contact.location.state || "",
        country: contact.location.country || "USA",
      },
      source: contact.source,
      status: contact.status,
      tags: contact.tags,
      notes: contact.notes,
      partnershipStatus: contact.partnershipStatus,
    });
    setShowAddDialog(true);
  };

  const getStatusBadge = (status: ContactStatus) => {
    const config = CONTACT_STATUSES[status];
    return (
      <Badge
        variant="outline"
        className={config.color}
      >
        {config.label}
      </Badge>
    );
  };

  const getPartnershipBadge = (status: PartnershipStatus) => {
    const config = PARTNERSHIP_STATUSES[status];
    return (
      <Badge
        variant="secondary"
        className={config.color}
      >
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CRM Contacts</h1>
          <p className="text-muted-foreground">
            Manage vendor contacts, partnerships, and outreach
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              setEditingContact(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Company & Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Elegant Events Venue"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>

                {/* Title & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Marketing Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: VendorCategory) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.icon} {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Website & Social */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      placeholder="@company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/company/..."
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.location.city}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value }
                      })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.location.state}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, state: e.target.value }
                      })}
                      placeholder="NY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.location.country}
                      onChange={(e) => setFormData({
                        ...formData,
                        location: { ...formData.location, country: e.target.value }
                      })}
                      placeholder="USA"
                    />
                  </div>
                </div>

                {/* Status & Partnership */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: ContactStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONTACT_STATUSES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnershipStatus">Partnership Status</Label>
                    <Select
                      value={formData.partnershipStatus}
                      onValueChange={(value: PartnershipStatus) => setFormData({ ...formData, partnershipStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PARTNERSHIP_STATUSES).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any relevant notes about this contact..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddDialog(false);
                    setEditingContact(null);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={editingContact ? handleUpdateContact : handleAddContact}>
                    {editingContact ? "Update Contact" : "Add Contact"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(VENDOR_CATEGORIES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(CONTACT_STATUSES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={partnershipFilter} onValueChange={setPartnershipFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Partnership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partnerships</SelectItem>
                {Object.entries(PARTNERSHIP_STATUSES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contacts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => ["affiliate", "advertiser", "referral_partner"].includes(c.partnershipStatus)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => ["contacted", "responded", "negotiating"].includes(c.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Converted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => c.status === "converted").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : contacts.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No contacts found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Get started by adding your first contact
              </p>
              <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg">
                      {VENDOR_CATEGORIES[contact.category]?.icon || "🏢"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{contact.company}</h4>
                        {getStatusBadge(contact.status)}
                        {contact.partnershipStatus !== "none" && getPartnershipBadge(contact.partnershipStatus)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {contact.contactName}
                          {contact.title && ` · ${contact.title}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {VENDOR_CATEGORIES[contact.category]?.label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </a>
                        )}
                        {contact.phone && (
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-1 hover:text-primary">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </a>
                        )}
                        {contact.website && (
                          <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        )}
                        {contact.instagram && (
                          <a href={`https://instagram.com/${contact.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Instagram className="h-3 w-3" />
                            Instagram
                          </a>
                        )}
                        {contact.linkedin && (
                          <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Add Outreach"
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowOutreachDialog(true);
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit"
                      onClick={() => openEditDialog(contact)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete"
                      onClick={() => handleDeleteContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outreach Dialog */}
      <Dialog open={showOutreachDialog} onOpenChange={setShowOutreachDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Log Outreach - {selectedContact?.company}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="outreachType">Type</Label>
              <Select
                value={outreachData.type}
                onValueChange={(value: typeof outreachData.type) => setOutreachData({ ...outreachData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="phone">📞 Phone Call</SelectItem>
                  <SelectItem value="dm_instagram">📸 Instagram DM</SelectItem>
                  <SelectItem value="dm_facebook">👥 Facebook Message</SelectItem>
                  <SelectItem value="dm_linkedin">💼 LinkedIn Message</SelectItem>
                  <SelectItem value="dm_tiktok">🎵 TikTok Message</SelectItem>
                  <SelectItem value="meeting">🤝 Meeting</SelectItem>
                  <SelectItem value="conference">🎤 Conference</SelectItem>
                  <SelectItem value="other">📝 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={outreachData.subject}
                onChange={(e) => setOutreachData({ ...outreachData, subject: e.target.value })}
                placeholder="Partnership inquiry"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outreachNotes">Notes</Label>
              <Textarea
                id="outreachNotes"
                value={outreachData.notes}
                onChange={(e) => setOutreachData({ ...outreachData, notes: e.target.value })}
                placeholder="Details about the outreach..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outcome">Outcome</Label>
                <Select
                  value={outreachData.outcome}
                  onValueChange={(value: typeof outreachData.outcome) => setOutreachData({ ...outreachData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">⏳ Pending</SelectItem>
                    <SelectItem value="positive">✅ Positive</SelectItem>
                    <SelectItem value="negative">❌ Negative</SelectItem>
                    <SelectItem value="no_response">😶 No Response</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={outreachData.followUpDate}
                  onChange={(e) => setOutreachData({ ...outreachData, followUpDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowOutreachDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddOutreach}>
                Log Outreach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
