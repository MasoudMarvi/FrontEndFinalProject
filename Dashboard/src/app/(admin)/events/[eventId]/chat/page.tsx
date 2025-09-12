"use client";

import { useParams } from 'next/navigation';
import EventChatComponent from '@/components/events/EventChatComponent';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

export default function EventChatPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  
  return (
    <>
      <PageBreadCrumb title="Event Chat" page="Chat" />
      <EventChatComponent eventId={eventId} />
    </>
  );
}