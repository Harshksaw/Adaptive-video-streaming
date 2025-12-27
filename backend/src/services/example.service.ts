export class ExampleService {
  private data: any[];

  constructor() {
    this.data = [
      { id: '1', name: 'Example 1', description: 'First example' },
      { id: '2', name: 'Example 2', description: 'Second example' }
    ];
  }

  async getAll(): Promise<any[]> {
    return this.data;
  }

  async getById(id: string): Promise<any | null> {
    const item = this.data.find(item => item.id === id);
    return item || null;
  }

  async create(payload: any): Promise<any> {
    const newItem = {
      id: String(this.data.length + 1),
      ...payload
    };
    this.data.push(newItem);
    return newItem;
  }

  async update(id: string, payload: any): Promise<any | null> {
    const index = this.data.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    this.data[index] = {
      ...this.data[index],
      ...payload
    };

    return this.data[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.data.findIndex(item => item.id === id);

    if (index === -1) {
      return false;
    }

    this.data.splice(index, 1);
    return true;
  }
}
