import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Logger } from '@nestjs/common';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {}
  /**
   * Creates a new user.
   * @param response - The response object to send the result.
   * @param createUserDto - The data transfer object containing user details.
   * @returns A JSON response with the status and created user data.
   */
  @Post()
  async createUser(
    @Res() response: Response,
    @Body() createUserDto: CreateUserDto,
  ) {
    try {
      const newUser = await this.userService.createUser(createUserDto);
      return response.status(HttpStatus.CREATED).json({
        message: 'User has been created successfully',
        newUser,
      });
    } catch {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Error: User not created!',
        error: 'Bad Request',
      });
    }
  }
  /**
   * Updates an existing user by ID.
   * @param response - The response object to send the result.
   * @param userId - The ID of the user to update.
   * @param updateUserDto - The data transfer object containing updated user details.
   * @returns A JSON response with the status and updated user data.
   */
  @Put('/:id')
  async updateUser(
    @Res() response: Response,
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const existingUser = await this.userService.updateUser(
        userId,
        updateUserDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'User has been successfully updated',
        existingUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  /**
   * Retrieves all users.
   * @param response - The response object to send the result.
   * @returns A JSON response with the status and all user data.
   */
  @Get()
  async getUsers(@Res() response: Response) {
    try {
      const userData = await this.userService.getAllUsers();
      return response.status(HttpStatus.OK).json({
        message: 'All users data found successfully',
        userData,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  @UseGuards(AuthGuard)
  @Get('/profile')
  async getProfile(
    @Res() response: Response,
    @Request()
    req: {
      user: { sub: string };
    },
  ) {
    try {
      // Extend Request type to include 'user'
      const userId = req.user?.sub;
      if (!userId) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
          message: 'User not authenticated',
        });
      }
      const userProfile = await this.userService.getUser(userId);
      return response.status(HttpStatus.OK).json({
        message: 'User profile retrieved successfully',
        user: userProfile,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  /**
   * Retrieves a user by ID.
   * @param response - The response object to send the result.
   * @param userId - The ID of the user to retrieve.
   * @returns A JSON response with the status and found user data.
   */
  @Get('/:id')
  async getUser(@Res() response: Response, @Param('id') userId: string) {
    try {
      const existingUser = await this.userService.getUser(userId);
      return response.status(HttpStatus.OK).json({
        message: 'User found successfully',
        existingUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
  /**
   * Deletes a user by ID.
   * @param response - The response object to send the result.
   * @param userId - The ID of the user to delete.
   * @returns A JSON response with the status and deleted user data.
   */
  @Delete('/:id')
  async deleteUser(@Res() response: Response, @Param('id') userId: string) {
    try {
      const deletedUser = await this.userService.deleteUser(userId);
      return response.status(HttpStatus.OK).json({
        message: 'User deleted successfully',
        deletedUser,
      });
    } catch ({ status, response: err }) {
      return response
        .status(
          typeof status === 'number'
            ? status
            : HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json(err);
    }
  }
}
