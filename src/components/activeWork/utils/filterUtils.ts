
import { WorkItem } from '@/types/activeWork';

/**
 * Filter work items based on active tab and search query
 */
export function filterWorkItems(
  items: WorkItem[],
  activeTab: string,
  searchQuery: string
): WorkItem[] {
  // First filter by tab selection
  let filteredItems: WorkItem[] = [];
  
  if (activeTab === 'all') {
    filteredItems = [...items];
  } else if (activeTab === 'projects') {
    filteredItems = items.filter(item => item.type === 'project');
  } else if (activeTab === 'workOrders') {
    filteredItems = items.filter(item => item.type === 'workOrder');
  }
  
  // Then apply search filter if a query exists
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const customerMatch = item.customerName?.toLowerCase().includes(query) || false;
      const idMatch = item.id.toLowerCase().includes(query);
      const poMatch = item.poNumber && item.poNumber.toLowerCase().includes(query);
      
      return titleMatch || customerMatch || idMatch || poMatch;
    });
  }
  
  return filteredItems;
}
