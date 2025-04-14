import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  CalendarDays,
  Star,
  Wrench,
  DollarSign,
  Package,
} from 'lucide-react';
import { Contact } from './hooks/useContact';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ContactDetailCardProps {
  contact: Contact;
}

const ContactDetailCard: React.FC<ContactDetailCardProps> = ({ contact }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contact.company && (
            <div className="flex items-start">
              <Building className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Company</p>
                <p className="text-muted-foreground">{contact.company}</p>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex items-start">
              <Mail className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{contact.email}</p>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-start">
              <Phone className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-muted-foreground">{contact.phone}</p>
              </div>
            </div>
          )}

          {(contact.address || contact.city || contact.state || contact.zip) && (
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-muted-foreground">
                  {contact.address && `${contact.address}, `}
                  {contact.city && `${contact.city}, `}
                  {contact.state && `${contact.state} `}
                  {contact.zip && contact.zip}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Status</p>
              <Badge
                variant="outline"
                className={`${
                  contact.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : contact.status === 'INACTIVE'
                      ? 'bg-gray-50 text-gray-700 border-gray-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {contact.status || 'Unknown'}
              </Badge>
            </div>
          </div>

          <div className="flex items-start">
            <CalendarDays className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-muted-foreground">
                {contact.created_at
                  ? format(new Date(contact.created_at), 'MMM d, yyyy')
                  : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start">
              <Wrench className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Type</p>
                <Badge variant="outline">{contact.contact_type || 'Unknown'}</Badge>
              </div>
            </div>

            {contact.role && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-muted-foreground">{contact.role}</p>
                </div>
              </div>
            )}

            {contact.specialty && (
              <div className="flex items-start">
                <Wrench className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Specialty</p>
                  <p className="text-muted-foreground">{contact.specialty}</p>
                </div>
              </div>
            )}

            {contact.hourly_rate !== undefined && contact.hourly_rate !== null && (
              <div className="flex items-start">
                <DollarSign className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Hourly Rate</p>
                  <p className="text-muted-foreground">${contact.hourly_rate.toFixed(2)}</p>
                </div>
              </div>
            )}

            {contact.rating !== undefined && contact.rating !== null && (
              <div className="flex items-start">
                <Star className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < contact.rating!
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {contact.materials && (
              <div className="flex items-start">
                <Package className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Materials</p>
                  <p className="text-muted-foreground">{contact.materials}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {contact.notes && (
          <div>
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="bg-muted/40 p-4 rounded-md">
              <p className="whitespace-pre-line">{contact.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactDetailCard;
