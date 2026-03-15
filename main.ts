import { nanoid } from 'nanoid';

// 1. Define strict Event interfaces
interface BaseEvent {
  type: string;
  payload: any;
  timestamp: number;
}

// 2. Optimized Store Class
class EvStore<TItem extends { id: string }> {
  private eventStore: BaseEvent[] = [];

  // The reducer (fold) determines how events change the state
  private fold(state: TItem[], event: BaseEvent): TItem[] {
    switch (event.type) {
      case "ITEM_ADDED":
        return [...state, event.payload];

      case "ITEM_UPDATED":
        return state.map(item => 
          item.id === event.payload.id ? { ...item, ...event.payload } : item
        );

      case "ITEM_REMOVED":
        return state.filter(item => item.id !== event.payload.id);

      case "STORE_INITIALIZED":
        return [];

      default:
        return state;
    }
  }
  public getState(): TItem[] {
    return this.eventStore.reduce(
      (state, event) => this.fold(state, event), 
      [] as TItem[]
    );
  }

  private commit(type: string, payload: any) {
    if (this.eventStore.length === 0) {
      this.eventStore.push({ type: "STORE_INITIALIZED", payload: null, timestamp: Date.now() });
    }
    this.eventStore.push({ type, payload, timestamp: Date.now() });
    return this.getState();
  }

  // --- Public API ---

  add(data: Omit<TItem, 'id'>): TItem[] {
    const newItem = { id: nanoid(), ...data } as TItem;
    return this.commit("ITEM_ADDED", newItem);
  }

  update(id: string, updates: Partial<Omit<TItem, 'id'>>): TItem[] {
    return this.commit("ITEM_UPDATED", { id, ...updates });
  }

  delete(id: string): TItem[] {
    return this.commit("ITEM_REMOVED", { id });
  }
  display(store = false){
    console.table(this.getState());
    if (store) console.table(this.eventStore)
  }
}

// --- Usage ---

export { EvStore }