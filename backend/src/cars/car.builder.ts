/**
 * Pattern: Builder
 * Constructs Car data objects step-by-step, ensuring all required fields are
 * set before the object is used. Replaces direct Car instantiation throughout
 * the app — every new car goes through CarBuilder.build().
 */
export interface CarData {
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  ownerId: string;
}

export class CarBuilder {
  private data: Partial<CarData> = {};

  setModel(model: string): this {
    this.data.model = model;
    return this;
  }

  setYear(year: number): this {
    this.data.year = year;
    return this;
  }

  setMileage(mileage: number): this {
    this.data.mileage = mileage;
    return this;
  }

  setPrice(price: number): this {
    this.data.price = price;
    return this;
  }

  setLocation(location: string): this {
    this.data.location = location;
    return this;
  }

  setOwnerId(ownerId: string): this {
    this.data.ownerId = ownerId;
    return this;
  }

  build(): CarData {
    const { model, year, mileage, price, location, ownerId } = this.data;
    if (!model || !year || mileage === undefined || !price || !location || !ownerId) {
      throw new Error(
        'CarBuilder: all fields (model, year, mileage, price, location, ownerId) are required',
      );
    }
    return { model, year, mileage, price, location, ownerId };
  }
}
