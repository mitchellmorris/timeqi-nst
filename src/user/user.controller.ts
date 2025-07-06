import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';

@Controller('user')
export class UserController {

	constructor(private readonly userService: UserService) { }
  /**
   * Creates a new user.
   * @param response - The response object to send the result.
   * @param createUserDto - The data transfer object containing user details.
   * @returns A JSON response with the status and created user data.
   */
	@Post()
	async createUser(@Res() response, @Body() createUserDto: CreateUserDto) {
		try {
			const newUser = await this.userService.createUser(createUserDto);
			return response.status(HttpStatus.CREATED).json({
				message: 'User has been created successfully',
				newUser,
			});
		} catch (err) {
			return response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: 400,
				message: 'Error: User not created!',
				error: 'Bad Request'
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
	async updateUser(@Res() response, @Param('id') userId: string,
		@Body() updateUserDto: UpdateUserDto) {
		try {
			const existingUser = await this.userService.updateUser(userId, updateUserDto);
			return response.status(HttpStatus.OK).json({
				message: 'User has been successfully updated',
				existingUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}
  /**
   * Retrieves all users.
   * @param response - The response object to send the result.
   * @returns A JSON response with the status and all user data.
   */
	@Get()
	async getUsers(@Res() response) {
		try {
			const userData = await this.userService.getAllUsers();
			return response.status(HttpStatus.OK).json({
				message: 'All users data found successfully', userData,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}
	/**
   * Retrieves a user by ID.
   * @param response - The response object to send the result.
   * @param userId - The ID of the user to retrieve.
   * @returns A JSON response with the status and found user data.
   */
	@Get('/:id')
	async getUser(@Res() response, @Param('id') userId: string) {
		try {
			const existingUser = await this.userService.getUser(userId);
			return response.status(HttpStatus.OK).json({
				message: 'User found successfully', existingUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}
  /**
   * Deletes a user by ID.
   * @param response - The response object to send the result.
   * @param userId - The ID of the user to delete.
   * @returns A JSON response with the status and deleted user data.
   */
	@Delete('/:id')
	async deleteUser(@Res() response, @Param('id') userId: string) {
		try {
			const deletedUser = await this.userService.deleteUser(userId);
			return response.status(HttpStatus.OK).json({
				message: 'User deleted successfully',
				deletedUser,
			});
		} catch (err) {
			return response.status(err.status).json(err.response);
		}
	}
}
