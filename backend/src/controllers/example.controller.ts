import { type Request, type Response } from 'express';
import { ExampleService } from '../services/example.service.js';

export class ExampleController {
  private exampleService: ExampleService;

  constructor() {
    this.exampleService = new ExampleService();
  }

  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.exampleService.getAll();
      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID parameter is required'
        });
        return;
      }
      const data = await this.exampleService.getById(id);

      if (!data) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.exampleService.create(req.body);
      res.status(201).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID parameter is required'
        });
        return;
      }
      const data = await this.exampleService.update(id, req.body);

      if (!data) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID parameter is required'
        });
        return;
      }
      const success = await this.exampleService.delete(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Resource deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}
