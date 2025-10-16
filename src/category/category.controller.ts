import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesService } from './category.service';
import { JwtGuard } from 'src/libs/services/auth/jwt.guard';
import { RolesGuard } from 'src/libs/services/auth/roles.guard';
import { Roles } from 'src/libs/helpers/decorators/roles.decorators';
import { UserRoles } from 'src/libs/utility/constants/enums';
import { CategoryListDto, CategoryOfProductDto } from './dto/listcategory.dto';

@ApiTags('Category')
@Controller('category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @Post('addCategory')
  addCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.addCategory(dto);
  }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Put('updateCategory/:id')
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  updateCategory(
    @Param('id') category_id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(category_id, dto);
  }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRoles.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Delete('deleteCategory/:id')
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  deleteCategory(@Param('id') category_id: number) {
    return this.categoriesService.deleteCategory(category_id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('viewCategory/:id')
  @ApiParam({ name: 'id', description: 'Category ID', type: Number })
  viewCategory(@Param('id') category_id: number) {
    return this.categoriesService.viewCategory(category_id);
  }

  @HttpCode(HttpStatus.OK)
  @Post('listOfCategories')
  listCategories(@Body() dto: CategoryListDto) {
    return this.categoriesService.listOfCategories(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('categoryOfProducts')
  async categoryOfProducts(@Body() dto: CategoryOfProductDto) {
    return this.categoriesService.categoryOfProducts(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get('categoryDropdown')
  categoryDropdown() {
    return this.categoriesService.categoryDropdown();
  }
}
