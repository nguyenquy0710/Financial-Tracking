import { Model, HydratedDocument, Document } from 'mongoose';

/**
 * Abstract base domain class providing common CRUD operations.
 * This class can be extended by specific domain classes to inherit these methods.
 * @param T - The Mongoose Document type.
 * @example
 * class UserDomain extends AbsBaseDomain<IUserModel> {
 *   constructor() {
 *    super(UserSchema);
 *  }
 * }
 * @author Your Name <your.email@example.com>
 * @date 2024-06-20
 * @version 1.0.0
 * @license MIT
 * @see {@link https://mongoosejs.com/docs/models.html|Mongoose Models}
 * @see {@link https://mongoosejs.com/docs/documents.html|Mongoose Documents}
 * @see {@link https://mongoosejs.com/docs/queries.html|Mongoose Queries}
 * @see {@link https://mongoosejs.com/docs/api/model.html|Mongoose Model API}
 * @see {@link https://mongoosejs.com/docs/api/document.html|Mongoose Document API}
 * @see {@link https://mongoosejs.com/docs/api/query.html|Mongoose Query API}
 * @see {@link https://mongoosejs.com/docs/api/schema.html|Mongoose Schema API}
 * @see {@link https://mongoosejs.com/docs/populate.html|Mongoose Populate}
 * @see {@link https://mongoosejs.com/docs/middleware.html|Mongoose Middleware}
 * @see {@link https://mongoosejs.com/docs/validation.html|Mongoose Validation}
 * @see {@link https://mongoosejs.com/docs/connections.html|Mongoose Connections}
 * @see {@link https://mongoosejs.com/docs/discriminators.html|Mongoose Discriminators}
 * @see {@link https://mongoosejs.com/docs/geojson.html|Mongoose GeoJSON}
 * @see {@link https://mongoosejs.com/docs/guide.html|Mongoose Guide}
 */
export default class AbsBaseRepository<T extends Document> {
  protected model: Model<T>;

  /**
   * Constructor to initialize the domain with a Mongoose model.
   * @param model - The Mongoose model to be used for CRUD operations.
   */
  constructor(model: Model<T>) {
    this.model = model;
  }

  /**
   * Find a document by its ID.
   * @param id - The ID of the document to find.
   * @returns A promise that resolves to the found document or null if not found.
   */
  async findById(id: string): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id).exec();
  }

  /**
   * Create a new document.
   * @param data - The data to create the new document.
   * @returns A promise that resolves to the created document.
   */
  async create(data: Partial<T>): Promise<HydratedDocument<T>> {
    const document = new this.model(data);
    await document.save();
    return document;
  }

  /**
   * Update an existing document by its ID.
   * @param id - The ID of the document to update.
   * @param data - The data to update the document with.
   * @returns A promise that resolves to the updated document or null if not found.
   */
  async update(id: string, data: Partial<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  /**
   * Delete a document by its ID.
   * @param id - The ID of the document to delete.
   * @returns A promise that resolves to true if the document was deleted, false otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
