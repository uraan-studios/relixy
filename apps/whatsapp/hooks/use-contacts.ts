"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useContacts() {
  const { data: contacts, mutate: mutateContacts, error } = useSWR("http://localhost:8080/contacts", fetcher, {
    refreshInterval: 5000,
  });

  const { data: labels, mutate: mutateLabels } = useSWR("http://localhost:8080/labels", fetcher);

  const createLabel = async (name: string, color: string) => {
    await fetch("http://localhost:8080/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    mutateLabels();
  };

  const deleteLabel = async (id: string) => {
    await fetch(`http://localhost:8080/labels/${id}`, {
      method: "DELETE",
    });
    mutateLabels();
    mutateContacts(); // Contacts might have this label removed
  };

  const addLabelToContact = async (contactId: string, labelId: string) => {
    await fetch(`http://localhost:8080/contacts/${contactId}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labelId }),
    });
    mutateContacts();
  };

  const removeLabelFromContact = async (contactId: string, labelId: string) => {
    await fetch(`http://localhost:8080/contacts/${contactId}/labels/${labelId}`, {
      method: "DELETE",
    });
    mutateContacts();
  };

  return {
    contacts: contacts?.data || contacts, // Handle if wrapper exists
    labels: labels || [],
    isLoading: !contacts && !error,
    isError: error,
    createLabel,
    deleteLabel,
    addLabelToContact,
    removeLabelFromContact,
  };
}
